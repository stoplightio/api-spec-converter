var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter'),
    jsonHelper = require('../utils/json'),
    YAML = require('js-yaml');

//TODO right now, no hiearachy support yet
//SL doesn't contain those info anyway

function RAMLDefinition(title, env) {
  this.title = title;
  //TODO anyway to know version?
  this.version = env.Version;
  this.baseUri = env.Host + env.BasePath;
  this.mediaType = env.DefaultResponseType || '';
  this.protocols = mapProtocols(env.Protocols);
}

RAMLDefinition.prototype.addMethod = function(resource, methodURIs, methodKey, method) {
  if (methodURIs.length <= 0) {
    //reach the leaf of tree
    //TODO optional: check same method existence
    if(!resource.uriParameters) {
      resource.uriParameters = {};
    };
    for (var attrname in method.uriParameters) {
      resource.uriParameters[attrname] = method.uriParameters[attrname];
    }
    delete method.uriParameters;
    resource[methodKey] = method;

  }
  else {
    var currentURI = '/' + methodURIs[0];
    if (!resource[currentURI]) {
      resource[currentURI] = {
        displayName: methodURIs[0],
        description: ''
      };
      //TODO uriParams?!?
    }
    methodURIs.splice(0, 1);
    this.addMethod(resource[currentURI], methodURIs, methodKey, method);
  }
};

function RAML() {
  this.metadata = null;
}

RAML.prototype = new Exporter();

RAML.prototype._mapRequestBody = function(bodyData){
  var body = {};
  if (bodyData.body) {
    var mimeType = bodyData.mimeType;
    switch(mimeType) {
      case 'application/json':
        body[mimeType] = {
          example: bodyData.example?jsonHelper.cleanNLCR(bodyData.example):'',
          schema: jsonHelper.cleanNLCR(bodyData.body)
        };
        break;
      case 'multipart/form-data':
      case 'application/x-www-form-urlencoded':
        var parsedBody = jsonHelper.parse(bodyData.body);
        body[mimeType] = {
          formParameters: parsedBody.properties
        };
        if (parsedBody.required && parsedBody.required.length > 0) {
          for(var i in parsedBody.required) {
            var requiredParam = parsedBody.required[i];
            if (body[mimeType]['formParameters'][requiredParam]){
              body[mimeType]['formParameters'][requiredParam].required = true;
            };
          }
        }
        break;
      default:
        //unsuported format
        //TODO
    }
  }
  return body;
};

RAML.prototype._mapRequestHeaders = function(headerData){
  var headers = {};
  headers = headerData.properties;
  return headers;
};

RAML.prototype._mapResponseBody = function(responseData){
  var responses = {};
  for(var i=0; i< responseData.length; i++) {
    resBody = responseData[i];
    if(resBody.codes.length>0) {
      var code = resBody.codes[0];
      responses[code] = {
        body: {}
      };

      if (resBody.description) {
        responses[code]['description'] = resBody.description;
      }

      var type = resBody.mimeType || 'application/json';
      responses[code]['body'][type] = {
        'schema': jsonHelper.cleanNLCR(resBody.body),
        'example': jsonHelper.cleanNLCR(resBody.example)
      };
    }
  }
  return responses;
};

RAML.prototype._mapQueryString = function(queryParams) {
  var queryString = {};
  for(var key in queryParams.properties) {
    queryString[key] = queryParams.properties[key];
    if(queryParams.required && queryParams.required.indexOf(key) > -1){
      queryString[key].required = true;
    }
  }
  return queryString;
};

//TODO: Stoplight doesn't support seperate path params completely yet
RAML.prototype._mapURIParams = function(pathParamData) {
  var pathParams = {};
  for(var key in pathParamData) {
    pathParams[key] = {};
    if(pathParamData[key].description) {
      pathParams[key].description = pathParamData[key].description;
    }
    if(pathParamData[key].type) {
      pathParams[key].type = pathParamData[key].type;
    }
  }
  return pathParams;
};

function mapProtocols(protocols) {
  var validProtocols = [];
  for(var i=0; i<protocols.length; i++) {
    if ((protocols[i].toLowerCase() != 'http') && (protocols[i].toLowerCase() != 'https')) {
      //RAML incompatible formats( 'ws' etc)
      continue;
    }
    validProtocols.push(protocols[i].toUpperCase());
  }
  return validProtocols;
}

RAML.prototype._mapSchema = function(slSchemas) {
  var results = [];
  for (var i in slSchemas) {
    var schema = slSchemas[i];
    var resultSchema = {};
    resultSchema[schema.NameSpace] = schema.Definition;
    results.push(resultSchema);
  }
  return results;
};


RAML.prototype._export = function () {
  var env = this.project.Environment;
  var ramlDef = new RAMLDefinition(this.project.Name, env);
  ramlDef.documentation = [{
    title: this.project.Name,
    content: this.project.Description
  }];

  var endpoints = this.project.Endpoints;
  for(var i in endpoints) {

    var endpoint = endpoints[i], parameters = [];

    var method = {};
    if (endpoint.Name) {
      method.displayName = endpoint.Name;
    }
    if (endpoint.Description) {
      method.description = endpoint.Description;
    }

    if (endpoint.Method.toLowerCase() === 'post' ||
        endpoint.Method.toLowerCase() === 'put' ||
        endpoint.Method.toLowerCase() === 'patch') {
      method.body = this._mapRequestBody(endpoint.Body);
    }

    method.headers = this._mapRequestHeaders(endpoint.Headers);

    method.responses = this._mapResponseBody(endpoint.Responses);

    method.queryParameters = this._mapQueryString(endpoint.QueryString);

    method.uriParameters = this._mapURIParams(endpoint.PathParams);

    var uriParts = endpoint.Path.split('/');
    uriParts.splice(0, 1);
    ramlDef.addMethod(ramlDef, uriParts, endpoint.Method, method);
  }

  ramlDef.schemas = this._mapSchema(this.project.Schemas);

  this.data = ramlDef;
};

RAML.prototype._getData = function(format) {
  switch (format) {
    case 'yaml':
      return '#%RAML 0.8\n'+YAML.safeDump(JSON.parse(JSON.stringify(this.Data)));
    default:
      throw Error('RAML doesn not support '+format+' format');
  }
};

module.exports = RAML;
