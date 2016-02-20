var parser = require('swagger-parser'),
    Endpoint = require('../entities/endpoint'),
    Schema = require('../entities/schema'),
    Importer = require('./importer'),
    Project = require('../entities/project'),
    jsonHelper = require('../utils/json'),
    swaggerHelper = require('../helpers/swagger'),
    YAML = require('yamljs'),
    _ = require('lodash');

function Swagger() {
  this.dereferencedAPI = null;
}

function needDeReferenced(ref) {
  if (!ref['$ref']) {
    return false;
  }
  var regex = /\/(parameters|responses)\//i;
  if (ref['$ref'].match(regex)) {
    return true;
  }
  return false;
}

Swagger.prototype = new Importer();

Swagger.prototype._mapSecurityDefinitions = function(securityDefinitions) {
  var result = {};
  for(var name in securityDefinitions) {
    var type = securityDefinitions[name].type;
    if (!result.hasOwnProperty(type)) {
      result[type] = {};
    }
    var sd = securityDefinitions[name];
    switch(type) {
      case 'apiKey':
        var keyPlaceHolder = (sd.in === 'header')?'headers':'queryString';
        if (!result[type].hasOwnProperty(keyPlaceHolder)){
          result[type][keyPlaceHolder] = [];
        }
        result[type][keyPlaceHolder].push({
          name: sd.name,
          value: ''
        });
        break;
      case 'oauth2':
        result[type] = {
          name: name,
          authorizationUrl: sd.authorizationUrl || '',
          scopes: slScopes,
          tokenUrl: sd.tokenUrl || ''
        };

        var slScopes = [], swaggerScopes = sd.scopes;

        if (swaggerScopes) {
          for(var key in swaggerScopes) {
            var scope = {};
            scope['name'] = key;
            scope['value'] = swaggerScopes[key];
            slScopes.push(scope);
          }
        }

        if (sd.flow) {
          result[type]['flow'] = sd.flow;
        }

        if (Array.isArray(slScopes) && slScopes.length > 0) {
          result[type]['scopes'] = slScopes;
        }

        break;
      case 'basic':
        result[type] = {
          name: name,
          value: '',
          description: sd.description || ''
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
    //create a close to remove extension properties
    var schemaDataClone = _.clone(schemaDefinitions[schemaName]);
    var re = /^x-/; //properties to avoid
    for(var prop in schemaDataClone) {
      if (prop.match(re)) {
        delete schemaDataClone[prop];
      }
    }
    sd.Definition = jsonHelper.stringify(schemaDataClone, 4);
    result.push(sd);
  }
  return result;
};

Swagger.prototype._mapQueryString = function(params, resolvedParameters) {
  var queryString = {type:'object', properties: {}, required: []};
  for (var i in params) {
    var param = params[i];
    if (needDeReferenced(param)) {
      //repsonses/parameters schemas
      param = resolvedParameters[i];
    }

    if (param.in && param.in !== 'query') {
      //skip other type of params
      continue;
    }
    queryString.properties[param.name] = swaggerHelper.setParameterFields(param, {});
    if (param.required) {
      queryString.required.push(param.name);
    }
  }
  return queryString;
};

Swagger.prototype._mapURIParams = function(params, resolvedParameters) {
  var pathParams = {type:'object', properties: {}, required: []};
  for (var i in params) {
    var param = params[i];
    if (needDeReferenced(param)) {
      param = resolvedParameters[i];
    }

    if (param.in && param.in !== 'path') {
      //skip other type of params
      continue;
    }
    pathParams.properties[param.name] = swaggerHelper.setParameterFields(param, {});
    pathParams.required.push(param.name);
  }

  return pathParams;
};

Swagger.prototype._mapRequestBody = function(params, reqType, resolvedParams) {
  var data = {mimeType: reqType || null, body: {properties: {}, required: []}, example: ''};

  for (var i in params) {
    var param = params[i];
    if (needDeReferenced(param)) {
      param = resolvedParams[i];
    }

    if (param.in && param.in !== 'body' && param.in !== 'formData') {
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

Swagger.prototype._mapResponseBody = function(responseBody, resType, resolvedResponses) {
  var data = [];
  for (var code in responseBody) {
    var res = {mimeType: resType, body: {}, example: '', codes: []}, description = '';
    // TODO: Once we support headers, then support headers from swagger spec in responses.
    if (needDeReferenced(responseBody[code])) {
        schema = resolvedResponses[code].schema;
        description = resolvedResponses[code].description || '';
        res.body = schema;
    } else if (responseBody[code].schema) {
      var schema = responseBody[code].schema;
      if (needDeReferenced(responseBody[code].schema)) {
        description = resolvedResponses[code].description || '';
        schema = resolvedResponses[code].schema;
      }
      res.body = schema;
    }

    if (responseBody[code].hasOwnProperty('examples')) {
      for(var t in responseBody[code].examples) {
        if (t === resType) {
          res.example = jsonHelper.stringify(responseBody[code].examples[t], 4);
        }
      }
    }

    res.description = description || responseBody[code].description || '';
    res.body = jsonHelper.stringify(res.body, 4);

    res.codes.push(code);
    data.push(res);
  }

  return data;
};

Swagger.prototype._mapRequestHeaders = function(params, resolvedParameters) {
  var data = {type: 'object', properties: {}, required: []};
  for (var i in params) {
    var param = params[i];
    if (needDeReferenced(param)) {
      param = resolvedParameters[i];
    } else if (param.in !== 'header') {
      //skip other type of params
      continue;
    }
    data.properties[param.name] = swaggerHelper.setParameterFields(param, {});;
    if (param.required) {
      data.required.push(param.name);
    }
  }
  return data;
};

Swagger.prototype._parseData = function(dataOrPath, cb) {
  var me = this;
  //in case of data, if not cloned, referenced to resolved data
  var dataCopy = _.cloneDeep(dataOrPath);
  parser.validate(dataCopy)
  .then(function(dereferencedAPI) {
    me.dereferencedAPI = dereferencedAPI;
    parser.parse(dataOrPath)
    .then(function(api){
        me.data = api;
        cb();
    })
    .catch(cb);
  })
  .catch(cb);
};

// Load a swagger spec by local or remote file path
Swagger.prototype.loadFile = function (path, cb) {
  return this._parseData(path, cb);
};

// Load a swagger spec by string data
Swagger.prototype.loadData = function(data) {
  var me = this, parsedData;
  return new Promise(function(resolve, reject){
    try {
      parsedData = JSON.parse(data);
    } catch(err) {
      //Possibly YAML Data
      try {
        parsedData = YAML.parse(data);
      } catch(err) {
        return reject(err);
      }
    }
    me._parseData(parsedData, function(err){
      if (err) return reject(err);
      resolve();
    });
  });
};

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
      var resolvedPathParames = this.dereferencedAPI?this.dereferencedAPI.paths[path].parameters: methods.parameters;
      pathParams = this._mapURIParams(methods.parameters, resolvedPathParames);
    }

    for (var method in methods) {
      var currentMethod = methods[method];
      var currentMethodResolved = this.dereferencedAPI?this.dereferencedAPI.paths[path][method]: currentMethod;

      if (method === 'parameters') {
        continue;
      }
      var endpoint = new Endpoint(currentMethod.operationId || ''),
        reqType = defaultReqContentType,
        resType = defaultResContentType;

      endpoint.Path = path;
      endpoint.Method = method;

      endpoint.Description = currentMethod.description || currentMethod.summary;
      endpoint.Summary = currentMethod.summary || '';

      //map request body
      if (methods[method].consumes) {
        //taking only one
        reqType = this.findDefaultMimeType(currentMethod.consumes);
      }
      if (endpoint.Method.toLowerCase() !== 'get' &&
          endpoint.Method.toLowerCase() !== 'head') {
        endpoint.Body = this._mapRequestBody(currentMethod.parameters, reqType, currentMethodResolved.parameters);
      }

      //map response body
      if (methods[method].produces) {
        //taking only one
        resType = this.findDefaultMimeType(currentMethod.produces);
      }
      endpoint.Responses = this._mapResponseBody(currentMethod.responses, resType, currentMethodResolved.responses);

      //map query string
      endpoint.QueryString = this._mapQueryString(currentMethod.parameters, currentMethodResolved.parameters);

      //if path params are defined in this level
      pathParams = _.merge(pathParams, this._mapURIParams(currentMethod.parameters, currentMethodResolved.parameters));

      //map path params
      endpoint.PathParams = pathParams;

      //map headers
      endpoint.Headers = this._mapRequestHeaders(currentMethod.parameters, currentMethodResolved.parameters);

      //map security
      if (currentMethod.security) {
        var securities = currentMethod.security;
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
  this.project.Environment.Host = this.data.host?(protocol + '://' + this.data.host) : null;
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
    this.project.Environment.SecuritySchemes = this._mapSecurityDefinitions(this.data.securityDefinitions);
  }



  var schemas = this._mapSchema(this.data.definitions);
  for(var i in schemas) {
    this.project.addSchema(schemas[i]);
  }
};

module.exports = Swagger;
