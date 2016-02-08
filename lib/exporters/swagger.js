var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter'),
    SwaggerParser = require('swagger-parser'),
    jsonHelper = require('../utils/json.js'),
    SwaggerDefinition = require('../entities/swagger/definition'),
    swaggerHelper = require('../helpers/swagger'),
    _ = require('lodash'),
    url = require('url');

function Swagger() {
  this.metadata = null;
}

function mapResponseTypes(slResponses) {
  var result = [];
  for(var i in slResponses) {
    var res = slResponses[i];
    if (res.mimeType) {
      result.push(res.mimeType);
    }
  }
  return _.uniq(result);
}


function validateParameters(parameters) {
  parameters = jsonHelper.orderByKeys(parameters, ['$ref', 'name', 'in', 'description', 'required', 'schema', 'type']);
  var validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'file'], defaultType = 'string';
  for(var i in parameters) {
    if (parameters[i].in != 'body') {
      if (Array.isArray(parameters[i].type)) {
        if(parameters[i].type.length > 0) {
          parameters[i].type = parameters[i].type[0];
        } else {
          parameters[i].type = defaultType;
        }
      }

      if(validTypes.indexOf(parameters[i].type) < 0) {
        //type not valid
        parameters[i].type = defaultType;
      }
    }
  }
  return parameters;
}

function constructSwaggerMethod(endpoint, parameters, responses, env) {
  var resultSwaggerMethod = {
    description: endpoint.Description,
    operationId: endpoint.Name,
    consumes: [endpoint.Body.mimeType || env.DefaultRequestType],
    produces: mapResponseTypes(endpoint.Responses),
    parameters: parameters,
    responses: responses,
    summary: endpoint.Summary
  };
  if (resultSwaggerMethod.operationId.length === 0) {
    //don't keep empty operationId in exported definition
    delete resultSwaggerMethod.operationId;
  }
  return resultSwaggerMethod;
}

Swagger.prototype = new Exporter();

Swagger.prototype._mapEndpointSecurity = function(securedByTypes, securityDefinitions) {
  var security = [];
  for (var type in securedByTypes) {
    var scheme = securityDefinitions[type];
    if (!scheme) {
      //definition error
    }
    switch (type) {
      case 'apiKey':
      case 'basic':
        var result = {};
        if (scheme.header) {
          result[scheme.header.name] = [];
        }
        if (scheme.query) {
          result[scheme.query.name] = [];
        }
        security.push(result);
        break;
      case 'oauth2':
        var result = {};
        result[scheme.name] = securedByTypes[type];
        security.push(result);
        break;
    }
  }
  return security;
};

Swagger.prototype._mapSecurityDefinitions = function(securityDefinitions) {
  var result = {};
  for(var type in securityDefinitions) {
    var sd = securityDefinitions[type];
    switch(type) {
      case 'apiKey':
        if (sd.hasOwnProperty('header')) {
          result[sd.header.name] = {
            name: sd.header.name,
            type: type,
            in: 'header'
          };
        }
        if (sd.hasOwnProperty('query')) {
          result[sd.query.name] = {
            name: sd.query.name,
            type: type,
            in: 'query'
          };
        }
        break;
      case 'oauth2':

        var slScopes = sd.scopes, swaggerScopes = {};
        for (var i in slScopes) {
          var scope = slScopes[i];
          swaggerScopes[scope.name] = scope.value;
        }

        result[sd.name] = {
          type: type,
          flow: sd.flow,
          scopes: swaggerScopes
        };

        if (['implicit', 'accessCode'].indexOf(sd.flow) >= 0) {
          result[sd.name]['authorizationUrl'] = sd.authorizationUrl;
        }

        if (['password', 'application', 'accessCode'].indexOf(sd.flow) >= 0) {
          result[sd.name]['tokenUrl'] = sd.tokenUrl;
        }
        break;
      case 'basic':
        result[type] = {
          type: type
        };
        break;
    }
  }
  return result;
};


Swagger.prototype._mapURIParams = function(pathParams) {
  var parameters = [];
  if (!pathParams.properties || Object.keys(pathParams).length == 0) {
    return parameters;
  }

  for (var paramName in pathParams.properties) {
    var prop = pathParams.properties[paramName];
    var param = swaggerHelper.setParameterFields(prop, {});
    param.name = paramName;
    param.in = 'path';
    param.required = true;
    param.type = 'string';
    if (prop.description) {
      param.description = prop.description;
    }
    parameters.push(param);
  }
  return parameters;
};

Swagger.prototype._mapQueryString = function(queryStringParams) {
  var parameters = [];
  if (!queryStringParams.properties) {
    return parameters;
  }
  for (var paramName in queryStringParams.properties) {
    var param = swaggerHelper.setParameterFields(queryStringParams.properties[paramName], {});
    param.name = paramName;
    param.in = 'query';
    if (queryStringParams.required &&
        queryStringParams.required.indexOf(param.name) >= 0) {
      param.required = true;
    }
    parameters.push(param);
  }
  return parameters;
};

Swagger.prototype._mapResponseBody = function(slResponses) {
  var result = {};
  for(var i in slResponses) {
    var res = slResponses[i], item = {description: res.description || ''};
    if (res.body && res.body !== '{}' && res.body.length > 2) {
      item.schema = jsonHelper.parse(res.body);
    }
    if (res.example && res.example !== '{}' && res.example.length > 2) {
      item.examples = {};
      item.examples[res.mimeType] = jsonHelper.parse(res.example);
    }
    result[((res.codes && res.codes.length > 0)?res.codes[0]:'default')] = item;
  }
  if (Object.keys(result).length == 0) {
    //empty schema for swagger spec validation
    result['default'] = {
      description: '',
      schema: {}
    };
  }
  return result;
};

Swagger.prototype._mapRequestBody = function(slRequestBody) {
  if (!slRequestBody.body) {
    return [];
  }
  var result = [], body = jsonHelper.parse(slRequestBody.body);

  if (body.properties && Object.keys(body.properties).length > 0 ||
      body.hasOwnProperty('$ref')) {
    //make sure body isn't empty
    var param = {};
    param = {
      name: 'body',
      in: 'body',
      schema: body
    };
    result.push(param);
  }

  return result;
};

Swagger.prototype._mapRequestHeaders = function(slHeaders) {
  var result = [];

  for(var property in slHeaders.properties) {
    var param = swaggerHelper.setParameterFields(slHeaders.properties[property], {});
    param.name = property;
    param.in = 'header';
    param.required = slHeaders.required && (slHeaders.required.indexOf(property) >= 0);
    param.description = slHeaders.properties[property].description || '';
    result.push(param);
  }
  return result;
};

Swagger.prototype._mapSchema = function(slSchemas) {
  var result = {};
  for (var i in slSchemas) {
    var schema = slSchemas[i];
    result[schema.NameSpace] = jsonHelper.parse(schema.Definition);
  }
  return result;
};

Swagger.prototype._mapEndpoints = function (swaggerDef, env) {
  var endpoints = this.project.Endpoints;
  for(var i in endpoints) {

    var endpoint = endpoints[i], parameters = [];

    if (!swaggerDef.paths[endpoint.Path]) {
      swaggerDef.paths[endpoint.Path] = {
         parameters: validateParameters(this._mapURIParams(endpoint.PathParams))
      };
    }
    swaggerDef.securityDefinitions = this._mapSecurityDefinitions(this.project.Environment.SecuritySchemes);
    parameters = parameters.concat(this._mapQueryString(endpoint.QueryString));
    parameters = parameters.concat(this._mapRequestBody(endpoint.Body));
    parameters = parameters.concat(this._mapRequestHeaders(endpoint.Headers));
    parameters = validateParameters(parameters);

    var responses = this._mapResponseBody(endpoint.Responses);
    swaggerDef.paths[endpoint.Path][endpoint.Method] = constructSwaggerMethod(endpoint, parameters, responses, env);
    //Is it OK to include produces/consumes in all cases?

    var security = [];
    if (endpoint.SecuredBy && !endpoint.SecuredBy.none) {
      swaggerDef.paths[endpoint.Path][endpoint.Method]['security'] = this._mapEndpointSecurity(endpoint.SecuredBy, this.project.Environment.SecuritySchemes);
    }
  }
};

Swagger.prototype._mapHostAndProtocol = function (env, swaggerDef) {
  var hostUrl = url.parse(env.Host);
  var swaggerHost = hostUrl.hostname || '';
  if (swaggerHost && hostUrl.port) {
    swaggerHost = swaggerHost + ':' + hostUrl.port;
  }
  swaggerDef.Host = swaggerHost;

  if(env.Protocols && env.Protocols.length>0) {
    swaggerDef.schemes = env.Protocols.map(function(p){
      return p.toLowerCase();
    });
  } else if(hostUrl.protocol) {
    swaggerDef.schemes = [hostUrl.protocol.split(':')[0]];
  } else {
    delete swaggerDef.schemes;
  }
};


Swagger.prototype._export = function () {
  //TODO
  var swaggerDef = new SwaggerDefinition(this.project.Name, this.project.Description);
  var env = this.project.Environment;
  swaggerDef.info.version = env.Version;
  swaggerDef.BasePath = env.BasePath || '';

  this._mapHostAndProtocol(env, swaggerDef);

  if(env.DefaultResponseType) {
    swaggerDef.produces = [env.DefaultResponseType];
  } else {
    delete swaggerDef.produces;
  }

  if(env.DefaultRequestType) {
    swaggerDef.consumes = [env.DefaultRequestType];
  } else {
    delete swaggerDef.consumes;
  }

  this._mapEndpoints(swaggerDef, env);

  swaggerDef.definitions = this._mapSchema(this.project.Schemas);

  //if not security definition added, then don't keep the field anymore
  if (swaggerDef.securityDefinitions && Object.keys(swaggerDef.securityDefinitions).length <= 0) {
    delete swaggerDef['securityDefinitions'];
  }
  this.data = jsonHelper.toJSON(swaggerDef);
};

module.exports = Swagger;
