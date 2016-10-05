var Exporter = require('./exporter');
var jsonHelper = require('../utils/json.js');
var stringHelper = require('../utils/strings.js');
var urlHelper = require('../utils/url');
var SwaggerDefinition = require('../entities/swagger/definition');
var swaggerHelper = require('../helpers/swagger');
var _ = require('lodash');
var url = require('url');

function Swagger() {
  this.metadata = null;
}

// from ref=type1 to $ref=#/definitions/type1
function convertRefFromModel(object) {
	var id;
	var val;
	for (id in object) {
		if ({}.hasOwnProperty.call(object, id)) {
			val = object[id];
			if (id === 'allOf') {
				object.allOf = val.map(function(obj) {
					if (typeof obj === 'object') return obj;
					return {
						$ref: `#/definitions/${obj}`,
					};
				});
			} else if (typeof val === 'string') {
				if (id === 'ref') {
					object.$ref = `#/definitions/${val}`;
					delete object[id];
				} else if (id === 'include') {
					object.$ref = val;
					delete object[id];
				}
			} else if (val && (typeof val) === 'object') {
				object[id] = convertRefFromModel(val);
			}
		}
	}
	return object;
}

function mapExample(data, target) {
	var example;
  if (!_.isEmpty(data.example)) {
    example = jsonHelper.parse(data.example);
    if (!_.isEmpty(example)) {
      target.example = example;
    }
  }
}

Swagger.prototype = new Exporter();

Swagger.prototype._getResponseTypes = function(endpoint, defaultResponseType) {
  var defRespType = defaultResponseType || [];
	var produces = endpoint.Produces || [];

  return produces.reduce(function(result, mimeType) {
    if (result.indexOf(mimeType) === -1 &&
        defRespType.indexOf(mimeType) === -1) {
      result.push(mimeType);
    }

    return result;
  }, []);
};

Swagger.prototype._getRequestTypes = function(endpoint, parameters, defaultRequestType) {
  var result = [];
	var typesToInclude = ['multipart/form-data', 'application/x-www-form-urlencoded'];
	var consumes = endpoint.Consumes || [];
	var defReqType = defaultRequestType || [];
	var i;

  for (i in parameters) {
    if (parameters[i].type && parameters[i].type === 'file') {
      // consumes must have 'multipart/form-data' or 'application/x-www-form-urlencoded'
      typesToInclude.forEach(function(mimeType) {
        if (!result.length) {
          if (consumes.indexOf(mimeType) >= 0) {
            result.push(mimeType);
          } else if (defReqType.indexOf(mimeType) >= 0) {
            result.push(mimeType);
          }
        }
      });
      if (!result.length) {
        // as swagger spec validation must want one of these, add one
        result.push(typesToInclude[0]);
      }
      // no need for the further iterations
      break;
    }
  }

  if (!_.isEmpty(consumes)) {
    consumes.forEach(function(mimeType) {
      if (defReqType.indexOf(mimeType) === -1) {
        result.push(mimeType);
      }
    });
  }

  return _.uniq(result);
};

Swagger.prototype._validateParameters = function(p) {
  var parameters = jsonHelper.orderByKeys(p, ['$ref', 'name', 'in', 'description', 'required', 'schema', 'type']);
  var validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'file'];
	var defaultType = 'string';
	var i;
  for (i in parameters) {
    if (parameters[i].in && parameters[i].in !== 'body') {
      if (Array.isArray(parameters[i].type)) {
        if (parameters[i].type.length > 0) {
          parameters[i].type = parameters[i].type[0];
        } else {
          parameters[i].type = defaultType;
        }
      }
      if (validTypes.indexOf(parameters[i].type) < 0) {
        // type not valid
        parameters[i].type = defaultType;
      }
    }
  }
  return parameters;
};

Swagger.prototype._constructTags = function(endpoint, env) {
  var tags = endpoint.tags || [];

  var group = _.find(env.GroupsOrder.docs, function(g) {
    return _.find(g.items, ['_id', endpoint._id]);
  });

  if (group) {
    tags.push(group.name);
  }

  return _.uniq(tags);
};

Swagger.prototype._constructSwaggerMethod = function(endpoint, parameters, responses, env) {
	var resultSwaggerMethod = {};
	var tags;
  var consumes = this._getRequestTypes(endpoint, parameters, env.Consumes);
  var produces = this._getResponseTypes(endpoint, env.Produces);
  endpoint.SetOperationId(endpoint.operationId, endpoint.Method, endpoint.Path);

  if (!_.isEmpty(endpoint.operationId)) {
    resultSwaggerMethod.operationId = endpoint.operationId;
  }

  if (!_.isEmpty(endpoint.Name)) {
    resultSwaggerMethod.summary = endpoint.Name;
  }

  tags = this._constructTags(endpoint, env);
  if (!_.isEmpty(tags)) {
    resultSwaggerMethod.tags = tags;
  }

  if (!_.isEmpty(endpoint.Description)) {
    resultSwaggerMethod.description = endpoint.Description;
  }

  if (_.isArray(consumes) && endpoint.Consumes && !_.isEqual(env.Consumes, consumes) && !_.isEmpty(consumes)) {
    resultSwaggerMethod.consumes = consumes.filter(_.isString);
  }

  if (_.isArray(produces) && endpoint.Produces && !_.isEqual(env.Produces, produces) && !_.isEmpty(produces)) {
    resultSwaggerMethod.produces = produces.filter(_.isString);
  }

  if (!_.isEmpty(parameters)) {
    resultSwaggerMethod.parameters = parameters;
  }

  resultSwaggerMethod.responses = responses;

  return resultSwaggerMethod;
};

Swagger.prototype._mapEndpointSecurity = function(securedByTypes, securityDefinitions) {
  var security = [];
	var type;
	var scheme;
	var basic;
	var i;
	var apiKey;
	var j;
	var apiKeyQueryString;
	var oauth2;
	for (type in securedByTypes) {
   	scheme = securityDefinitions[type];
    if (!scheme) {
      // definition error
      continue;
    }
    switch (type) {
      case 'basic':
        basic = {};
        if (scheme.name) {
          basic[scheme.name] = [];
          security.push(basic);
        }
        break;
      case 'apiKey':
        if (scheme.headers && scheme.headers.length > 0) {
          for (i in scheme.headers) {
            apiKey = {};
            apiKey[scheme.headers[i].name] = [];
            security.push(apiKey);
          }
        }
        if (scheme.queryString && scheme.queryString.length > 0) {
          for (j in scheme.queryString) {
            apiKeyQueryString = {};
            apiKeyQueryString[scheme.queryString[j].name] = [];
            security.push(apiKeyQueryString);
          }
        }
        break;
      case 'oauth2':
        oauth2 = {};
        oauth2[type] = securedByTypes[type];
        security.push(oauth2);
        break;
			default:
				break;
    }
  }
  return security;
};

Swagger.prototype._mapSecurityDefinitions = function(securityDefinitions) {
  var result = {};
	var type;
	var sd;
	var i;
	var header;
	var j;
	var qs;
	var slScopes;
	var swaggerScopes;
	var k;
	var scope;
  for (type in securityDefinitions) {
    sd = securityDefinitions[type];
    switch (type) {
      case 'apiKey':
        if ({}.hasOwnProperty.call(sd, 'headers') && sd.headers.length > 0) {
          for (i in sd.headers) {
            header = sd.headers[i];
            result[header.name] = {
              name: header.name,
              type: type,
              in: 'header',
            };
          }
        }
        if ({}.hasOwnProperty.call(sd, 'queryString') && sd.queryString.length > 0) {
          for (j in sd.queryString) {
            qs = sd.queryString[j];
            result[qs.name] = {
              name: qs.name,
              type: type,
              in: 'query',
            };
          }
        }
        break;
      case 'oauth2':

        slScopes = sd.scopes;
				swaggerScopes = {};
				for (k in slScopes) {
          scope = slScopes[k];
          swaggerScopes[scope.name] = scope.value;
        }

        result[type] = {
          type: type,
          flow: sd.flow,
          scopes: swaggerScopes,
        };

        if (['implicit', 'accessCode'].indexOf(sd.flow) >= 0) {
          result[type].authorizationUrl = sd.authorizationUrl;
        }

        if (['password', 'application', 'accessCode'].indexOf(sd.flow) >= 0) {
          result[type].tokenUrl = sd.tokenUrl;
        }
        break;
      case 'basic':
        if (sd.name) {
          result[sd.name] = {
            type: type,
          };

          if (!_.isEmpty(sd.description)) {
            result[sd.name].description = sd.description;
          }
        }
        break;
			default:
				break;
    }
  }
  return result;
};


Swagger.prototype._mapURIParams = function(pathParams) {
  var parameters = [];
	var paramName;
	var prop;
	var param;
  if (!pathParams.properties || _.isEmpty(pathParams)) {
    return parameters;
  }

  for (paramName in pathParams.properties) {
    prop = pathParams.properties[paramName];
    param = swaggerHelper.setParameterFields(prop, {});
    param.name = paramName;
    param.in = 'path';
    param.required = true;
    param.type = param.type || 'string';
    if (!_.isEmpty(prop.description)) {
      param.description = prop.description;
    }
    parameters.push(param);
  }
  return parameters;
};

Swagger.prototype._mapQueryString = function(queryStringParams) {
  var parameters = [];
	var paramName;
	var param;
  if (!queryStringParams.properties) {
    return parameters;
  }
  for (paramName in queryStringParams.properties) {
    param = swaggerHelper.setParameterFields(queryStringParams.properties[paramName], {});
    param.name = paramName;
    param.in = 'query';
    param.required = (queryStringParams.required &&
        queryStringParams.required.indexOf(param.name) >= 0);
    parameters.push(param);
  }
  return parameters;
};

function mapResponseBody(res, mimeType) {
	var body;
  var item = {};

  item.description = res.description || '';

  // if response body mimeType is null, do not include schema in swagger export
  // TODO: Figure out how to set example for mimeType properly.
  // if (!mimeType) {
  //   return item;
  // }

  body = jsonHelper.parse(res.body);
  if (body && !_.isEmpty(body)) {
    item.schema = convertRefFromModel(body);
  }

  if (mimeType && mimeType !== '' && res.example && res.example !== '{}' && res.example.length > 2) {
    item.examples = {};
    item.examples[mimeType] = jsonHelper.parse(res.example);
  }

  return item;
}

Swagger.prototype._mapResponseBody = function(endpoint) {
  var slResponses = endpoint.Responses;
	var i;
	var res;
	var mimeType;
	var item;

  var result = {};
  for (i in slResponses) {
    res = slResponses[i];
    mimeType = (endpoint.Produces && endpoint.Produces.length) ? endpoint.Produces[0] : null;
    // if (!mimeType && env.Produces && env.Produces.length) {
    //   mimeType = env.Produces[0];
    // }
    item = mapResponseBody(res, mimeType);
    result[(res.codes && res.codes.length > 0 && parseInt(res.codes[0], 10) ? res.codes[0] : 'default')] = item;
  }

  return result;
};

Swagger.prototype._mapRequestBody = function(slRequestBody, requestTypes) {
	var result = [];
	var body;
	var param = {};
	var regex = /"type":[ ]*"file"|"type":[ ]*"binary"/;
	var prop;
	if (!slRequestBody.body) {
    return result;
  }
	body = jsonHelper.parse(slRequestBody.body) || {};

  if (!_.isEmpty(slRequestBody.description)) {
    param.description = slRequestBody.description;
  }

  if (!jsonHelper.isEmptySchema(body)) {
    // make sure body isn't empty
    // export as formData only if schema includes file type property
    if (slRequestBody.body.match(regex) ||
      ['multipart/form-data', 'application/x-www-form-urlencoded'].indexOf(requestTypes[0]) !== -1) {
      for (prop in body.properties) {
        param = body.properties[prop];
        param.in = 'formData';
        param.name = prop;
        if (body.required && body.required.indexOf(prop) >= 0) {
          param.required = true;
        }
        result.push(param);
      }
    } else {
      if (body.required && body.required.length <= 0) {
        delete body.required;
      }

      mapExample(slRequestBody, body);

      param.name = 'body';
      param.in = 'body';
      param.schema = convertRefFromModel(body);

      result.push(param);
    }
  }

  return result;
};

Swagger.prototype._mapRequestHeaders = function(slHeaders) {
  var result = [];
	var property;
	var param;
	var desc;

  if (slHeaders) {
    for (property in slHeaders.properties) {
      param = swaggerHelper.setParameterFields(slHeaders.properties[property], {});
      param.name = property;
      param.in = 'header';
      param.required = slHeaders.required && (slHeaders.required.indexOf(property) >= 0);

      desc = slHeaders.properties[property].description;
      if (!_.isEmpty(desc)) {
        param.description = slHeaders.properties[property].description;
      }

      result.push(param);
    }
  }

  return result;
};

Swagger.prototype._mapSchema = function(slSchemas) {
  var result = {};
	var i;
	var schema;
	var definition;
  for (i in slSchemas) {
    schema = slSchemas[i];
    definition = convertRefFromModel(jsonHelper.parse(schema.Definition));
    mapExample(schema, definition);
    result[schema.NameSpace] = definition;
  }
  return result;
};

Swagger.prototype._mapEndpointTraitParameters = function(endpoint, existingParams) {
	var params = [];
	var i;
	var trait;
	var p1;
	var p2;
	if (!endpoint.traits || !endpoint.traits.length) {
    return [];
  }

  for (i in endpoint.traits) {
    trait = _.find(this.project.Traits, ['_id', endpoint.traits[i]]);

    if (!trait) {
      continue;
    }

    try {
      for (p1 in jsonHelper.parse(trait.request.queryString).properties) {
        // only add it if we didn't already explicitly define it in the operation
        if (!_.find(existingParams, {name: p1, in: 'query'})) {
          params.push({
            $ref: `#/parameters/${stringHelper.computeTraitName(trait.name, p1)}`,
          });
        }
      }
    } catch (e) {
			// ignored
		}

    try {
      for (p2 in jsonHelper.parse(trait.request.headers).properties) {
        // only add it if we didn't already explicitly define it in the operation
        if (!_.find(existingParams, {name: p2, in: 'header'})) {
          params.push({
            $ref: `#/parameters/${stringHelper.computeTraitName(trait.name, p2)}`,
          });
        }
      }
    } catch (e) {
			// ignored
		}
  }

  return params;
};

Swagger.prototype._mapEndpointTraitResponses = function(endpoint) {
	var result = {};
	var i;
	var trait;
	var j;
	var res;
	var code;
	if (!endpoint.traits || !endpoint.traits.length) {
		return [];
	}

  for (i in endpoint.traits) {
    trait = _.find(this.project.Traits, ['_id', endpoint.traits[i]]);
    if (!trait) {
      continue;
    }

    for (j in trait.responses) {
      res = trait.responses[j];
			code = (res.codes && res.codes.length > 0 && parseInt(res.codes[0], 10) ? res.codes[0] : 'default');

      result[code] = {
        $ref: `#/responses/${stringHelper.computeTraitName(trait.name, code)}`,
      };
    }
  }

  return result;
};

Swagger.prototype._mapEndpoints = function(swaggerDef, env) {
  var endpoints = this.project.Endpoints;
	var i;
	var endpoint;
	var parameters;
	var requestTypes;
	var params;
	var responses;
	var security;

  // Collect endpoints ids from environment resourcesOrder
  var orderedIds = env.resourcesOrder.docs.reduce(function(ids, group) {
    return ids.concat(_.map(_.filter(group.items, {type: 'endpoints'}), '_id'));
  }, []);

  // Sort endpoints similar to resourcesOrder items order
  endpoints.sort(function(a, b) {
    return orderedIds.indexOf(a._id) < orderedIds.indexOf(b._id) ? -1 : 1;
  });

  for (i in endpoints) {
    endpoint = endpoints[i];
		parameters = [];
    requestTypes = this._getRequestTypes(endpoint, parameters, env.Consumes);
    // To build parameters we need to grab data from body for supported mimeTypes
    requestTypes = _.isEmpty(requestTypes) ? env.Consumes : requestTypes;

    if (!swaggerDef.paths[endpoint.Path]) {
      params = this._validateParameters(this._mapURIParams(endpoint.PathParams));
      swaggerDef.paths[endpoint.Path] = params.length ? {parameters: params} : {};
    }

    parameters = parameters.concat(this._mapQueryString(endpoint.QueryString));

    if (!_.isEmpty(requestTypes)) {
      parameters = parameters.concat(this._mapRequestBody(endpoint.Body, requestTypes));
    }

    parameters = parameters.concat(this._mapRequestHeaders(endpoint.Headers));
    parameters = parameters.concat(this._mapEndpointTraitParameters(endpoint, parameters));
    parameters = this._validateParameters(parameters);

    responses = _.assign({}, this._mapEndpointTraitResponses(endpoint), this._mapResponseBody(endpoint, env));
    if (_.isEmpty(responses)) {
      // empty schema for swagger spec validation
      responses.default = {
        description: '',
        schema: {},
      };
    }

    // if (_.isEmpty(endpoint.Produces)) {
    //   for (var statusCode in responses) {
    //     var response = responses[statusCode];
    //     delete response.schema;
    //   }
    // }

    swaggerDef.paths[endpoint.Path][endpoint.Method] = this._constructSwaggerMethod(endpoint, parameters, responses, env);
    // Is it OK to include produces/consumes in all cases?

    if (endpoint.SecuredBy) {
      security = this._mapEndpointSecurity(endpoint.SecuredBy, this.project.Environment.SecuritySchemes);
      if (!_.isEmpty(security)) {
        swaggerDef.paths[endpoint.Path][endpoint.Method].security = security;
      }
    }
  }
};

Swagger.prototype._mapTraitParameters = function(traits) {
  var parameters = {};
	var i;
	var trait;
	var params;
	var qs;
	var headers;
	var p;
	var param;

  for (i in traits) {
    trait = traits[i];
		params = [];

    try {
      qs = jsonHelper.parse(trait.request.queryString);
      if (!jsonHelper.isEmptySchema(qs)) {
        params = params.concat(this._validateParameters(this._mapQueryString(qs)));
      }
    } catch (e) {
			// ignored
		}

    try {
      headers = jsonHelper.parse(trait.request.headers);
      if (!jsonHelper.isEmptySchema(headers)) {
        params = params.concat(this._validateParameters(this._mapRequestHeaders(headers)));
      }
    } catch (e) {
			// ignored
		}

    for (p in params) {
      param = params[p];
      parameters[stringHelper.computeTraitName(trait.name, param.name)] = param;
    }
  }

  return parameters;
};

Swagger.prototype._mapTraitResponses = function(traits) {
  var responses = {};
	var i;
	var trait;
	var j;
	var res;
	var item;
	var responseName;

  for (i in traits) {
    trait = traits[i];
    for (j in trait.responses) {
      res = trait.responses[j];
			item = mapResponseBody(res);
			responseName = stringHelper.computeTraitName(trait.name, (res.codes && res.codes.length > 0 && parseInt(res.codes[0], 10) ? res.codes[0] : 'default'));

      responses[responseName] = item;
    }
  }

  return responses;
};

Swagger.prototype._mapHostAndProtocol = function(env, swaggerDef) {
	var filteredSchemes;
  var acceptedSchemes = ['http', 'https', 'ws', 'wss'];
  var hostUrl = url.parse(env.Host || '');
  var swaggerHost = hostUrl.hostname || '';
  if (swaggerHost && hostUrl.port) {
    swaggerHost = `${swaggerHost}:${hostUrl.port}`;
  }
  swaggerDef.Host = swaggerHost;

  // If host has path on it, prepend to base path
  swaggerDef.BasePath = env.BasePath;
  if (hostUrl.path && hostUrl.path !== '/') {
    swaggerDef.BasePath = urlHelper.join(hostUrl.path, env.BasePath);
  }

  if (Array.isArray(env.Protocols) && !_.isEmpty(env.Protocols)) {
    filteredSchemes = [];
    env.Protocols.forEach(function(p) {
      if (acceptedSchemes.indexOf(p.toLowerCase()) >= 0) {
        filteredSchemes.push(p.toLowerCase());
      }
    });
    swaggerDef.schemes = filteredSchemes;
  } else if (hostUrl.protocol) {
    swaggerDef.schemes = [hostUrl.protocol.split(':')[0]];
  } else {
    delete swaggerDef.schemes;
  }
};


Swagger.prototype._export = function() {
  // TODO
	var parameters;
	var responses;
  var swaggerDef = new SwaggerDefinition(this.project.Name, this.project.Description);
  var env = this.project.Environment;
  swaggerDef.info.version = env.Version;
  swaggerDef.BasePath = env.BasePath || '';

  this._mapHostAndProtocol(env, swaggerDef);

  if (env.Produces && env.Produces.length > 0) {
    swaggerDef.produces = env.Produces;
  } else {
    delete swaggerDef.produces;
  }

  if (env.Consumes && env.Consumes.length > 0) {
    swaggerDef.consumes = env.Consumes;
  } else {
    delete swaggerDef.consumes;
  }

  swaggerDef.definitions = this._mapSchema(this.project.Schemas);

  parameters = this._mapTraitParameters(this.project.Traits);
  if (!_.isEmpty(parameters)) {
    swaggerDef.parameters = parameters;
  } else {
    delete swaggerDef.parameters;
  }

  responses = this._mapTraitResponses(this.project.Traits);
  if (!_.isEmpty(responses)) {
    swaggerDef.responses = responses;
  } else {
    delete swaggerDef.responses;
  }

  swaggerDef.securityDefinitions = this._mapSecurityDefinitions(this.project.Environment.SecuritySchemes);

  this._mapEndpoints(swaggerDef, env);

  // if not security definition added, then don't keep the field anymore
  if (swaggerDef.securityDefinitions && _.isEmpty(swaggerDef.securityDefinitions)) {
    delete swaggerDef.securityDefinitions;
  }
  this.data = jsonHelper.toJSON(swaggerDef);
};

module.exports = Swagger;
