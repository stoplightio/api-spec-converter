var _ = require('lodash'),
    Exporter = require('./exporter'),
    ramlHelper = require('../helpers/raml'),
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
    }
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
	this.hasTags = false;
	this.hasDeprecated = false;
	this.hasExternalDocs = false;
}

RAML.prototype = new Exporter();

RAML.prototype._mapSecurityScheme = function(slSecuritySchemes) {
  var ramlSecuritySchemes = {};

  if (slSecuritySchemes.hasOwnProperty('oauth2')) {
    var name = slSecuritySchemes.oauth2.name || 'oauth2';
    //missing describedBy, description

    ramlSecuritySchemes[name] = {
      type: 'OAuth 2.0',
      settings: {
        authorizationUri: slSecuritySchemes.oauth2.authorizationUrl,
        accessTokenUri: slSecuritySchemes.oauth2.tokenUrl,
        authorizationGrants: this.mapAuthorizationGrants(slSecuritySchemes.oauth2.flow)
      }
    };
  }

  if (slSecuritySchemes.hasOwnProperty('basic')) {
    var basicName = slSecuritySchemes.basic.name;
    if (basicName) {
      ramlSecuritySchemes[basicName] = {
        type: 'Basic Authentication',
        description: slSecuritySchemes.basic.description || ''
      };
    }
  }
  
  if (slSecuritySchemes.hasOwnProperty('apiKey')) {
		var name = null;
		var content = null;
		var description = null;
		if (slSecuritySchemes.apiKey.headers && !_.isEmpty(slSecuritySchemes.apiKey.headers)) {
			name = slSecuritySchemes.apiKey.headers[0].externalName;
			var key_name = slSecuritySchemes.apiKey.headers[0].name;
			description = slSecuritySchemes.apiKey.headers[0].description;
			content = {
				headers: {}
			};
			content['headers'][key_name] = {
			  type: 'string'
			};
		} else if (slSecuritySchemes.apiKey.queryString) {
		}
		
		ramlSecuritySchemes[name] = {
			type: 'Pass Through',
			describedBy: content,
			description: description
		};
	
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
          if (type !== 'integer' && type !== 'number') {
            delete params[key][prop];
          }
          break;
        case 'required':
        case 'displayName':
        case 'description':
        case 'example':
        case 'repeat':
        case 'default':
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

    if (!mimeType) {
      return body;
    }

    switch(mimeType) {
      case 'application/json':
        body[mimeType] = this.mapBody(bodyData);
        break;
      case 'multipart/form-data':
      case 'application/x-www-form-urlencoded':
        var parsedBody = jsonHelper.parse(bodyData.body);
        body[mimeType] = this.mapRequestBodyForm(parsedBody);
        break;
      default:
        //unsuported format
        //TODO
    }

    if (bodyData.description) {
        body[mimeType].description = bodyData.description;
    }
  }
  return body;
};

RAML.prototype._mapNamedParams = function(params){
  var newParams = {};
  for(var key in params.properties) {
    newParams[key] = ramlHelper.setParameterFields(params.properties[key], {});
    if(params.required && params.required.indexOf(key) > -1){
      newParams[key].required = true;
    }
    newParams[key] = jsonHelper.orderByKeys(newParams[key], ['type', 'description']);
  }
  return this._validateParam(newParams);
};

RAML.prototype._mapResponseBody = function(responseData){
  var responses = {};

  for(var i in responseData) {
    resBody = responseData[i];
      if (!_.isEmpty(resBody.codes)) {
      var code = resBody.codes[0];
      if (code === 'default' || parseInt(code) == 'NaN') {
        continue;
      }

      responses[code] = {
        body: {}
      };

      var type = resBody.mimeType;

      if (resBody.mimeType) {
        responses[code]['body'][type] = this.mapBody(resBody);
      } else {
        responses[code] = {};
      }

      if (resBody.description) {
        responses[code]['description'] = resBody.description;
      }

      if (!jsonHelper.isEmptySchema(resBody.headers)) {
        responses[code]['body'][type].headers = this._mapNamedParams(resBody.headers);
      }
    }
  }
  return responses;
};

//TODO: Stoplight doesn't support seperate path params completely yet
RAML.prototype._mapURIParams = function(pathParamData) {
  var pathParams = {};
  if(!pathParamData.properties || Object.keys(pathParamData.properties).length == 0) {
    return pathParams;
  }

  for(var key in pathParamData.properties) {
    var prop = pathParamData.properties[key];

    pathParams[key] = ramlHelper.setParameterFields(prop, {});
    if(prop.description) {
      pathParams[key].displayName = prop.description;
    }

    pathParams[key].type = pathParams[key].type || 'string';
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

RAML.prototype._mapTextSections = function(slTexts) {
  var results = [];
  for (var i in slTexts) {
    var text = slTexts[i];

    if (text.divider || _.isEmpty(text.name) || _.isEmpty(text.content)) {
      continue;
    }

    results.push({
      title: text.name,
      content: text.content
    });
  }
  return results;
};

// from ref=type1 to type=type1
RAML.prototype.convertRefFromModel = function(object) {
  for (var id in object) {
    if (object.hasOwnProperty(id)) {
      var val = object[id];
      if (id == 'ref') {
        object.type = val;
        delete object[id];
      } else if ((typeof val) === 'object') {
        object[id] = this.convertRefFromModel(val);
      }
    }
  }

  return object;
};

RAML.prototype._mapTraits = function(slTraits) {
  var traits = [];

  for (var i in slTraits) {
    var slTrait = slTraits[i],
        trait = {};

    try {
      var schema = JSON.parse(slTrait.request.queryString);
      if (!jsonHelper.isEmptySchema(schema)) {
        trait.queryParameters = this._mapNamedParams(schema);
      }
    } catch(e) {}

    try {
      var schema = JSON.parse(slTrait.request.headers);
      if (!jsonHelper.isEmptySchema(schema)) {
        trait.headers = this._mapNamedParams(schema);
      }
    } catch(e) {}

    try {
      if (slTrait.responses && slTrait.responses.length) {
        trait.responses = this._mapResponseBody(slTrait.responses);
      }
    } catch(e) {}

    var newTrait = {};
    newTrait[_.camelCase(slTrait.name)] = trait;
    traits.push(newTrait);
  }

  return traits;
};

RAML.prototype._mapEndpointTraits = function(slTraits, endpoint) {
  var is = [];

  for (var i in endpoint.traits) {
    var trait = _.find(slTraits, ['_id', endpoint.traits[i]]);
    if (!trait) {
      continue;
    }
    is.push(_.camelCase(trait.name));
  }

  return is;
};

RAML.prototype._export = function () {
  var env = this.project.Environment;
  var ramlDef = new RAMLDefinition(this.project.Name, env);

  ramlDef.documentation = [{
    title: this.project.Name,
    content: this.project.Description
  }];

  var docs = this._mapTextSections(this.project.Texts);
  if (docs.length) {
    ramlDef.documentation = ramlDef.documentation.concat(docs);
  }

  var slSecuritySchemes = this.project.Environment.SecuritySchemes;
  var securitySchemes = this._mapSecurityScheme(slSecuritySchemes);

  if (!_.isEmpty(securitySchemes)) {
    ramlDef.securitySchemes = securitySchemes;
  }

  var endpoints = this.project.Endpoints;

  // Collect endpoints ids from environment resourcesOrder
  var orderedIds = env.resourcesOrder.docs.reduce(function(ids, group) {
    return ids.concat(_.map(_.filter(group.items, {type: 'endpoints'}), '_id'));
  }, []);

  // Sort endpoints similar to resourcesOrder items order
  endpoints.sort(function (a, b) {
    return orderedIds.indexOf(a._id) < orderedIds.indexOf(b._id) ? -1 : 1;
  });

  for(var i in endpoints) {

    var endpoint = endpoints[i];

    var method = {};
    if (endpoint.operationId || endpoint.Name) {
      method.displayName = endpoint.operationId || endpoint.Name;
    }
    if (endpoint.Description) {
      method.description = endpoint.Description;
    }
    if (endpoint.Summary) {
      method.description = endpoint.Summary + '. ' + method.description;
    }

    var is = this._mapEndpointTraits(this.project.Traits, endpoint);
    if (is.length) {
      method.is = is;
    }

    if (endpoint.Method.toLowerCase() === 'post' ||
        endpoint.Method.toLowerCase() === 'put' ||
        endpoint.Method.toLowerCase() === 'patch') {
      method.body = this._mapRequestBody(endpoint.Body);
    }

    method.headers = this._mapNamedParams(endpoint.Headers);

    method.responses = this._mapResponseBody(endpoint.Responses);

    method.queryParameters = this._mapURIParams(endpoint.QueryString);

    method.uriParameters = this._mapURIParams(endpoint.PathParams);

    if (endpoint.securedBy) {
      var rsecuredBy = [];
      if (endpoint.securedBy.oauth2) {
        rsecuredBy.push(slSecuritySchemes.oauth2.name || 'oauth2');
      }
      if (endpoint.securedBy.basic && slSecuritySchemes.basic.name) {
        rsecuredBy.push(slSecuritySchemes.basic.name);
      }
      if (endpoint.securedBy.apiKey) {
				if (slSecuritySchemes.apiKey) {
					if (!_.isEmpty(slSecuritySchemes.apiKey.headers)) {
						rsecuredBy.push(slSecuritySchemes.apiKey.headers[0].externalName);
					} else if (!_.isEmpty(slSecuritySchemes.apiKey.queryString)) {
						rsecuredBy.push(slSecuritySchemes.apiKey.queryString[0].externalName);
					}
				}
			}
      if (rsecuredBy.length > 0) {
        method.securedBy = rsecuredBy;
      }
    }

    var uriParts = endpoint.Path.split('/');
    uriParts.splice(0, 1);
    ramlDef.addMethod(ramlDef, uriParts, endpoint.Method, method);
		
		if (endpoint.Tags && !_.isEmpty(endpoint.Tags)) {
			this.hasTags = true;
			method['(tags)'] = endpoint.Tags;
		}
	
		if (endpoint.Deprecated) {
			this.hasDeprecated = true;
			method['(deprecated)'] = endpoint.Deprecated;
		}
		
		if (endpoint.ExternalDocs) {
			this.hasExternalDocs = true;
			method['(externalDocs)'] = {
				"description": endpoint.ExternalDocs.description,
				"url": endpoint.ExternalDocs.url
			};
		}
  }

	if (this.hasTags || this.hasDeprecated || this.hasExternalDocs) {
		ramlDef.annotationTypes = {};
		if (this.hasTags) {
			ramlDef.annotationTypes.tags = "string[]";
		}
		
		if (this.hasDeprecated) {
			ramlDef.annotationTypes.deprecated = "boolean";
		}
		
		if (this.hasExternalDocs) {
			ramlDef.annotationTypes.externalDocs = {
				"description": "string",
				"url": "string"
			};
		}
	}

  this.addSchema(ramlDef, this.mapSchema(this.project.Schemas));
  ramlDef.traits = this._mapTraits(this.project.Traits);

  // Clean empty field in definition
  for (var field in ramlDef) {
    if (ramlDef.hasOwnProperty(field) && !ramlDef[field]) {
      delete ramlDef[field];
    }
  }

  this.data = ramlDef;
};

RAML.prototype._getData = function(format) {
  switch (format) {
    case 'yaml':
      return '#%RAML ' + this.version() + '\n'+YAML.dump(JSON.parse(JSON.stringify(this.Data)), {lineWidth: -1});
    default:
      throw Error('RAML doesn not support '+format+' format');
  }
};

RAML.prototype.version = function() { throw new Error('version method not implemented'); };

RAML.prototype.mapAuthorizationGrants = function(flow) { throw new Error('mapAuthorizationGrants method not implemented');  };

RAML.prototype.mapBody = function(bodyData) { throw new Error('mapBody method not implemented'); };

RAML.prototype.mapRequestBodyForm = function(bodyData) { throw new Error('mapRequestBodyForm method not implemented'); };

RAML.prototype.addSchema = function(ramlDef, schema) { throw new Error('addSchema method not implemented'); };

RAML.prototype.mapSchema = function(schema) { throw new Error('mapSchema method not implemented'); };

module.exports = RAML;
