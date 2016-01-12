var parser = require('swagger-parser'),
    Endpoint = require('../entities/endpoint'),
    Schema = require('../entities/schema'),
    Importer = require('./importer'),
    Project = require('../entities/project'),
    jsonHelper = require('../utils/json');

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
        //TODO
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
  var pathParams = {};
  for (var i in params) {
    var param = params[i];
    if (param.hasOwnProperty('$ref')) {
      //any unresolved data?!?
      //console.log(i, param)
    }
    if (param.in !== 'path') {
      //skip other type of params
      continue;
    }
    pathParams[param.name] = {
      type: param.type,
      description: param.description
    };

    if (param.type === 'array') {
      pathParams[param.name].items = param.items;
    }
  }

  return pathParams;
};

Swagger.prototype._mapRequestBody = function(params, reqType) {
  var data = {mimeType: reqType, body: {properties: {}, required: []}, example: ''};

  for (var i in params) {
    var param = params[i];
    if (param.in !== 'body' && param.in !== 'formData') {
      //skip other type of params
      continue;
    }

    data.body.properties[param.name] = {};
    if (param.schema) {
      data.body.properties[param.name] = param.schema;
    }
    if (param.description) {
      data.body.properties[param.name].description = param.description;
    }
    else if (param.type) {
      data.body.properties[param.name]['type'] = param.type;
    }
    if (param.required) {
      data.body.required.push(param.name);
    }
  }
  return data;
};

Swagger.prototype._mapResponseBody = function(responseBody, resType) {
  var data = [], defaultCodeTaken = false;
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

    if (code === 'default') {
      //swagger default usually meant for error responses:
      //https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#responses-object
      code = 400;
    }
    if (code === 400 || code === '400') {
      if (defaultCodeTaken) continue;
      defaultCodeTaken = true;
    }

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
          me.$refs = $refs.values()[me.filePath];
          cb();
        })
        .catch(function(err) {
          cb(err);
        });
    })
    .catch(function(err) {
      cb(err);
    });
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

Swagger.prototype._import = function() {

  var defaultReqContentType = this.findDefaultMimeType(this.data.consumes),
      defaultResContentType = this.findDefaultMimeType(this.data.produces);

  this.project = new Project(this.data.info.title);
  this.project.Description = this.data.info.description || '';

  this.project.Environment.BasePath = this.data.basePath || '';
  this.project.Environment.Host = this.data.host || 'http://localhost:3000';
  this.project.Environment.Version = this.data.info.version;

  if (this.data.schemes && this.data.schemes.length > 0) {
    this.project.Environment.Protocols = this.data.schemes;
  }

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
      endpoint.Body = this._mapRequestBody(methods[method].parameters, reqType);

      //map response body
      if (methods[method].produces) {
        //taking only one
        resType = this.findDefaultMimeType(methods[method].produces);
      }
      endpoint.Responses = this._mapResponseBody(methods[method].responses, resType);

      //map query string
      endpoint.QueryString = this._mapQueryString(methods[method].parameters);

      //map path params
      endpoint.PathParams = pathParams;

      //map headers
      endpoint.Headers = this._mapRequestHeaders(methods[method].parameters);

      //map security
      if (methods[method].security) {
        for (var securityIndex in methods[method].security) {
          var keys = Object.keys(methods[method].security[securityIndex]);
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
              //TODO
              break;
          }
        }
      }

      this.project.addEndpoint(endpoint);
    }
  }

  var schemas = this._mapSchema(this.data.definitions);
  for(var i in schemas) {
    this.project.addSchema(schemas[i]);
  }
};

module.exports = Swagger;
