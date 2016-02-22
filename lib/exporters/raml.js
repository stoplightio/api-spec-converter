var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter'),
    jsonHelper = require('../utils/json'),
    YAML = require('js-yaml');

function RAMLDefinition(title, env) {
  this.title = title;
  //TODO anyway to know version?
  this.version = env.Version;
  this.baseUri = env.Host + env.BasePath;
  this.mediaType = env.DefaultResponseType || '';
  this.protocols = mapProtocols(env.Protocols);
}

RAMLDefinition.prototype.addMethod = function(resource, methodURIs, methodKey, method) {
  if (!methodURIs) {
    return;
  }

  if (methodURIs.length <= 0) {
    //reach the leaf of tree
    //TODO optional: check same method existence
    if(!resource.uriParameters) {
      resource.uriParameters = {};
    };
    for (var attrname in method.uriParameters) {
      //uri not available, so check with displayName, which is same
      var isURIParamExist = resource.displayName.split(attrname).length - 1;
      if (isURIParamExist) {
        resource.uriParameters[attrname] = method.uriParameters[attrname];
      }
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

RAML.prototype._mapSecurityScheme = function(slSecuritySchemes) {
  var ramlSecuritySchemes = [];

  if (slSecuritySchemes.hasOwnProperty('oauth2')) {
    var ramlSecurityScheme = {};
    var name = slSecuritySchemes.oauth2.name || 'oauth2';
    //missing describedBy, description
    ramlSecurityScheme[name] = {
      type: 'OAuth 2.0',
      settings: {
        authorizationUri: slSecuritySchemes.oauth2.authorizationUrl,
        accessTokenUri: slSecuritySchemes.oauth2.tokenUrl
      }
    };
    var ag = [];
    switch(slSecuritySchemes.oauth2.flow) {
      case 'implicit':
        ag = ['token'];
        break;
      case 'password':
        ag = ['credentials'];
        break;
      case 'application':
        ag = ['owner'];
        break;
      case 'accessCode':
        ag = ['code'];
        break;

    };
    ramlSecurityScheme[name].settings['authorizationGrants']  = ag;
    ramlSecuritySchemes.push(ramlSecurityScheme);
  }

  if (slSecuritySchemes.hasOwnProperty('basic')) {
    var ramlSecurityScheme = {}, name = slSecuritySchemes.basic.name;
    if (name) {
      ramlSecurityScheme[name] = {
        type: 'Basic Authentication',
        description: slSecuritySchemes.basic.description || ''
      };
    }
    ramlSecuritySchemes.push(ramlSecurityScheme);
  }

  return ramlSecuritySchemes;
};

RAML.prototype._validateParam = function(params) {
  var acceptedTypes = ['string', 'number', 'integer', 'date', 'boolean', 'file'];
  for(var key in params) {
    var param = params[key];
    for (var prop in param) {
      switch (prop) {
        case 'type':
          var type = params[key].type;
          if (acceptedTypes.indexOf(type) < 0) {
            //not supported type, delete param
            delete params[key];
            continue;
          }
          break;
        case 'enum':
        case 'pattern':
        case 'minLength':
        case 'maxLength':
          if (params[key].type !== 'string') {
            delete params[key][prop];
          }
          break;
        case 'minimum':
        case 'maximum':
          var type = params[key].type.toLowerCase();
          if (type !== 'integer' || type !== 'number') {
            delete params[key][prop];
          }
          break;
        case 'required':
        case 'displayName':
        case 'description':
        case 'example':
          break;
        default:
          //not supported types
          if (params[key]) {
            delete params[key][prop];
          }
      }
    }
  }
  return params;
};

RAML.prototype._mapRequestBody = function(bodyData){
  var body = {};
  if (bodyData.body) {
    var mimeType = bodyData.mimeType;
    switch(mimeType) {
      case 'application/json':
        body[mimeType] = {
          example: bodyData.example?jsonHelper.format(bodyData.example):'',
          schema: jsonHelper.format(bodyData.body)
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
  for(var key in headers) {
    headers[key] = jsonHelper.orderByKeys(headers[key], ['type', 'description']);
  }
  return this._validateParam(headers);
};

RAML.prototype._mapResponseBody = function(responseData){
  var responses = {};

  for(var i in responseData) {
    resBody = responseData[i];
    if(resBody.codes && Array.isArray(resBody.codes) && resBody.codes.length>0) {
      var code = resBody.codes[0];
      if (code === 'default' || parseInt(code) == 'NaN') {
        continue;
      }
      responses[code] = {
        body: {}
      };

      if (resBody.description) {
        responses[code]['description'] = resBody.description;
      }

      var type = resBody.mimeType || 'application/json';
      responses[code]['body'][type] = {
        'schema': jsonHelper.format(resBody.body),
        'example': jsonHelper.format(resBody.example)
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
    queryString[key] = jsonHelper.orderByKeys(queryString[key], ['type', 'description']);
  }
  return this._validateParam(queryString);
};

//TODO: Stoplight doesn't support seperate path params completely yet
RAML.prototype._mapURIParams = function(pathParamData) {
  var pathParams = {};
  if(!pathParamData.properties || Object.keys(pathParamData.properties).length == 0) {
    return pathParams;
  }

  for(var key in pathParamData.properties) {
    var prop = pathParamData.properties[key];
    pathParams[key] = {};
    if(prop.description) {
      pathParams[key].displayName = prop.description;
    }
    pathParams[key].type = prop.type || 'string';
  }
  return this._validateParam(pathParams);
};

function mapProtocols(protocols) {
  var validProtocols = [];
  for(var i in protocols) {
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
    resultSchema[schema.NameSpace] =  jsonHelper.format(schema.Definition);
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
  var slSecuritySchemes = this.project.Environment.SecuritySchemes;
  var securitySchemes = this._mapSecurityScheme(slSecuritySchemes);
  if (Array.isArray(securitySchemes) && securitySchemes.length > 0) {
    ramlDef.securitySchemes = securitySchemes;
  }

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

    if (endpoint.securedBy) {
      var rsecuredBy = [];
      if (endpoint.securedBy.oauth2) {
        rsecuredBy.push(slSecuritySchemes.oauth2.name || 'oauth2');
      }
      if (endpoint.securedBy.basic && slSecuritySchemes.basic.name) {
        rsecuredBy.push(slSecuritySchemes.basic.name);
      }
      if (rsecuredBy.length > 0) {
        method.securedBy = rsecuredBy;
      }
    }

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
