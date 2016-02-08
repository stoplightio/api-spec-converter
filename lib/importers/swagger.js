var parser = require('swagger-parser'),
    Endpoint = require('../entities/endpoint'),
    Schema = require('../entities/schema'),
    Importer = require('./importer'),
    Project = require('../entities/project'),
    jsonHelper = require('../utils/json'),
    swaggerHelper = require('../helpers/swagger'),
    _ = require('lodash');

function Swagger() {
  this.metadata = null;
  this.$refs = null;
  this.filePath = null;
}

Swagger.prototype = new Importer();

Swagger.prototype._mapSecurityDefinitions = function(securityDefinitions) {
  var result = {};
  for(var name in securityDefinitions) {
    var type = securityDefinitions[name].type;
    result[type] = {};
    switch(type) {
      case 'apiKey':
        if (securityDefinitions[name].in !== undefined && securityDefinitions[name].in != '') {
          result[type][securityDefinitions[name].in] = {
            name: securityDefinitions[name].name,
            value: ''
          };
        }
        break;
      case 'oauth2':
        result[type] = {
          name: name,
          authorizationUrl: securityDefinitions[name].authorizationUrl || '',
          scopes: slScopes,
          tokenUrl: securityDefinitions[name].tokenUrl || ''
        };

        var slScopes = [], swaggerScopes = securityDefinitions[name].scopes;

        if (swaggerScopes) {
          for(var key in swaggerScopes) {
            var scope = {};
            scope['name'] = key;
            scope['value'] = swaggerScopes[key];
            slScopes.push(scope);
          }
        }

        if (securityDefinitions[name].flow) {
          result[type]['flow'] = securityDefinitions[name].flow;
        }

        if (slScopes.length > 0) {
          result[type]['scopes'] = slScopes;
        }

        break;
      case 'basic':
        result[type]['header'] = {
          name: securityDefinitions[name].name,
          value: '',
          description: securityDefinitions[name].description || ''
        };
        break;
    }
  }
  return result;
};

Swagger.prototype._mapSchema = function(schemaDefinitions) {
  var result = [];
  for (var schemaName in schemaDefinitions) {
    var sd = new Schema(schemaName);
    sd.Name = schemaName;
    sd.Definition = jsonHelper.stringify(schemaDefinitions[schemaName], 4);
    result.push(sd);
  }
  return result;
};

Swagger.prototype._mapQueryString = function(params) {
  var queryString = {type:'object', properties: {}, required: []};
  for (var i in params) {
    var param = params[i];
    if (param.in !== 'query') {
      //skip other type of params
      continue;
    }
    queryString.properties[param.name] = {
      type: param.type,
      description: param.description
    };
    if (param.required) {
      queryString.required.push(param.name);
    }
    if (param.type === 'array') {
      queryString.properties[param.name].items = param.items;
    }
  }
  return queryString;
};

Swagger.prototype._mapURIParams = function(params) {
  var pathParams = {type:'object', properties: {}, required: []};
  for (var i in params) {
    var param = params[i];
    if (param.in !== 'path') {
      //skip other type of params
      continue;
    }
    pathParams.properties[param.name] = swaggerHelper.setParameterFields(param, {});
  }

  return pathParams;
};

Swagger.prototype._mapRequestBody = function(params, reqType) {
  var data = {mimeType: reqType || null, body: {properties: {}, required: []}, example: ''};

  for (var i in params) {
    var param = params[i];
    if (param.in !== 'body' && param.in !== 'formData') {
      //skip other type of params
      if (param.hasOwnProperty('$ref')) {
        data.body = param;
      }
      continue;
    }

    switch(param.in) {
      case 'body':
        data.body = param.schema;
        break;
      case 'formData':
      default:
        var prop = {};
        prop = swaggerHelper.setParameterFields(param, prop);
        if (param.required) {
          data.body.required.push(param.name);
        }
        data.body.properties[param.name] = prop;
    }
  }

  //remove required field if doesn't have anything inside it
  if (data.body.required && data.body.required.length == 0) {
    delete data.body.required;
  }
  return data;
};

Swagger.prototype._mapResponseBody = function(responseBody, resType) {
  var data = [];
  for (var code in responseBody) {
    var res = {mimeType: resType, body: {}, example: '', codes: []};
    if (responseBody[code].schema) {
      res.body = responseBody[code].schema;
    }
    if (responseBody[code].hasOwnProperty('examples')) {
      for(var t in responseBody[code].examples) {
        if (t === resType) {
          res.example = jsonHelper.stringify(responseBody[code].examples[t], 4);
        }
      }
    }

    res.description = responseBody[code].description || '';
    res.body = jsonHelper.stringify(res.body, 4);

    res.codes.push(code);
    data.push(res);
  }

  return data;
};

Swagger.prototype._mapRequestHeaders = function(params) {
  var data = {type: 'object', properties: {}, required: []};
  for (var i in params) {
    var param = params[i];
    if (param.in !== 'header') {
      //skip other type of params
      continue;
    }
    data.properties[param.name] = {
      type: param.type,
      description: param.description || ''
    };
    if (param.required) {
      data.required.push(param.name);
    }
  }
  return data;
};

Swagger.prototype.loadFile = function (path, cb) {
  var me = this;
  this.filePath = path;

  parser.parse(path)
  .then(function(api, metadata) {
    me.data = api;
    me.metadata = metadata;
    parser.resolve(path)
      .then(function($refs) {
        try {
          me.$refs = $refs.values()[me.filePath];
        } catch(err) {
          //ignore reference error
        }
        cb();
      })
      .catch(cb);
  })
  .catch(cb);
};

/*Swagger.prototype.loadData = function(data, cb) {
  parser.validate(myAPI)
  .then(function(api) {
    cb();
  })
  .catch(function(err) {
    ccb(err);
  });
};*/

//for now, if 'application/json' exist in supported type, use that
Swagger.prototype.findDefaultMimeType = function(mimeTypes) {
  if (!mimeTypes || mimeTypes.length <= 0) {
    return 'application/json';
  }
  for(var i in mimeTypes) {
    if (mimeTypes[i] === 'application/json') {
      return mimeTypes[i];
    }
  }
  return mimeTypes[0];
};

Swagger.prototype._mapEndpoints = function(defaultReqContentType, defaultResContentType) {
  for (var path in this.data.paths) {
    var methods = this.data.paths[path];
    var pathParams = {};
    if (methods.parameters) {
      pathParams = this._mapURIParams(methods.parameters);
    }

    for (var method in methods) {
      if (method === 'parameters') {
        continue;
      }
      var endpoint = new Endpoint(methods[method].operationId || ''),
        reqType = defaultReqContentType,
        resType = defaultResContentType;

      endpoint.Path = path;
      endpoint.Method = method;

      endpoint.Description = methods[method].description || methods[method].summary;
      endpoint.Summary = methods[method].summary || '';

      //map request body
      if (methods[method].consumes) {
        //taking only one
        reqType = this.findDefaultMimeType(methods[method].consumes);
      }
      if (endpoint.Method.toLowerCase() !== 'get' &&
          endpoint.Method.toLowerCase() !== 'head') {
        endpoint.Body = this._mapRequestBody(methods[method].parameters, reqType);
      }

      //map response body
      if (methods[method].produces) {
        //taking only one
        resType = this.findDefaultMimeType(methods[method].produces);
      }
      endpoint.Responses = this._mapResponseBody(methods[method].responses, resType);

      //map query string
      endpoint.QueryString = this._mapQueryString(methods[method].parameters);

      //if path params are defined in this level
      pathParams = _.merge(pathParams, this._mapURIParams(methods[method].parameters));

      //map path params
      endpoint.PathParams = pathParams;

      //map headers
      endpoint.Headers = this._mapRequestHeaders(methods[method].parameters);

      //map security
      if (methods[method].security) {
        var securities = methods[method].security;
        for (var securityIndex in securities) {
          var keys = Object.keys(securities[securityIndex]);
          var securityName = keys[0];
          var scheme = this.data.securityDefinitions[securityName];
          if (!scheme) {
            //definition error
            continue;
          }
          switch(scheme.type) {
            case 'apiKey':
            case 'basic':
              if (endpoint.SecuredBy.none) {
                endpoint.SecuredBy = {};
              }
              endpoint.SecuredBy[scheme.type] = true;
              break;
            case 'oauth2':
              if (endpoint.SecuredBy.none) {
                endpoint.SecuredBy = {};
              }
              endpoint.SecuredBy[scheme.type] = securities[securityIndex][securityName];
              break;
          }
        }
      }

      this.project.addEndpoint(endpoint);
    }
  }
};

Swagger.prototype._import = function() {

  var defaultReqContentType = this.findDefaultMimeType(this.data.consumes),
      defaultResContentType = this.findDefaultMimeType(this.data.produces);

  this.project = new Project(this.data.info.title);
  this.project.Description = this.data.info.description || '';

  var protocol = 'http';
  if (this.data.schemes && this.data.schemes.length > 0) {
    this.project.Environment.Protocols = this.data.schemes;
    protocol = this.data.schemes[0];
  }

  this._mapEndpoints(defaultReqContentType, defaultResContentType);

  this.project.Environment.BasePath = this.data.basePath || '';
  this.project.Environment.Host = protocol + '://' + this.data.host || 'http://localhost:3000';
  this.project.Environment.Version = this.data.info.version;

  if (this.data.produces) {
    //taking the first as default one
    this.project.Environment.DefaultResponseType = defaultResContentType;
  }

  if (this.data.consumes) {
    //taking the first as default one
    this.project.Environment.DefaultRequestType = defaultReqContentType;
  }
  if (this.data.securityDefinitions) {
    this.project.SecuritySchemes = this._mapSecurityDefinitions(this.data.securityDefinitions);
  }



  var schemas = this._mapSchema(this.data.definitions);
  for(var i in schemas) {
    this.project.addSchema(schemas[i]);
  }
};

module.exports = Swagger;
