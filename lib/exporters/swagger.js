var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter'),
    SwaggerParser = require('swagger-parser');



function SwaggerDefinition(title, description) {
  this.swagger = '2.0';
  this.info = {
    'version': '',
    'title': title,
    'description': description
  };

  this.paths = {};

  this.definitions = {};
}

function Swagger() {
  this.metadata = null;
}

Swagger.prototype = new Exporter();


Swagger.prototype._mapURIParams = function(pathParams) {
  var parameters = [];
  for (var paramName in pathParams) {
    var param = pathParams[paramName];
    param.name = paramName;
    param.in = 'path';
    param.required = true;
    param.type = 'string';
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
    var param = queryStringParams.properties[paramName];
    param.name = paramName;
    param.in = 'query';
    if (queryStringParams.required.indexOf(param.name) > 0) {
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
      item.schema = JSON.parse(res.body);
    }
    if (res.example && res.example !== '{}' && res.example.length > 2) {
      item.examples = {};
      item.examples[res.mimeType] = JSON.parse(res.example);
    }
    result[((res.codes && res.codes.length > 0)?res.codes[0]:'default')] = item;
  }
  return result;
};

function mapResponseTypes(slResponses) {
  var result = [];
  for(var i in slResponses) {
    var res = slResponses[i];
    if (res.mimeType) {
      result.push(res.mimeType);
    }
  }
  return result;
}

Swagger.prototype._mapRequestBody = function(slRequestBody) {
  if (!slRequestBody.body) {
    return [];
  }
  var result = [], body = JSON.parse(slRequestBody.body);
  for (var property in body.properties) {
    //var param = body.properties[property]
    var param = {};
    param.type = 'string';
    param.name = property;

    //TODO identify body/formData properly
    if (!body.properties[property].type || body.properties[property].type === 'object') {
      //it would pass with json-schema validation disabled
      param.in = 'body';
    }
    else {
      param.in = 'formData';
    }

    if (body.properties[property].schema) {
      param.schema = body.properties[property].schema;
    }
    param.required = body.required && (body.required.indexOf(property) > 0);

    param.description = body.properties[property].description || '';
    result.push(param);
  }
  return result;
};

Swagger.prototype._mapRequestHeaders = function(slHeaders) {
  var result = [];

  for(var property in slHeaders.properties) {
    var param = slHeaders.properties[property];
    param.name = property;
    param.in = 'header';
    param.required = slHeaders.required && (slHeaders.required.indexOf(property) > 0);
    param.description = slHeaders.properties[property].description || '';
    result.push(param);
  }
  return result;
};

Swagger.prototype._mapSchema = function(slSchemas) {
  var result = {};
  for (var i in slSchemas) {
    var schema = slSchemas[i];
    result[schema.NameSpace] = schema.Definition;
  }
  return result;
};

Swagger.prototype._export = function () {
  //TODO
  var swaggerDef = new SwaggerDefinition(this.project.Name, this.project.Description);
  var env = this.project.Environment;
  swaggerDef.info.version = env.Version;

  swaggerDef.basePath = env.BasePath;
  swaggerDef.host = env.Host;

  if(env.Protocols && env.Protocols.length>0) {
    swaggerDef.schemes = env.Protocols;
  }

  if(env.DefaultResponseType) {
    swaggerDef.produces = [env.DefaultResponseType];
  }

  if(env.DefaultRequestType) {
    swaggerDef.consumes = [env.DefaultRequestType];
  }

  var endpoints = this.project.Endpoints;
  for(var i in endpoints) {

    var endpoint = endpoints[i], parameters = [];

    if (!swaggerDef.paths[endpoint.Path]) {
      swaggerDef.paths[endpoint.Path] = {
         parameters: this._mapURIParams(endpoint.PathParams)
      };
    }
    parameters = parameters.concat(this._mapQueryString(endpoint.QueryString));
    parameters = parameters.concat(this._mapRequestBody(endpoint.Body));
    parameters = parameters.concat(this._mapRequestHeaders(endpoint.Headers));
    swaggerDef.paths[endpoint.Path][endpoint.Method] = {
      responses: this._mapResponseBody(endpoint.Responses),
      parameters: parameters,
      consumes: [endpoint.Body.mimeType],
      produces: mapResponseTypes(endpoint.Responses),
      operationId: endpoint.Name,
      summary: endpoint.Summary,
      description: endpoint.Description
    };
  }
  swaggerDef.definitions = this._mapSchema(this.project.Schemas);
  this.data = swaggerDef;
};

module.exports = Swagger;
