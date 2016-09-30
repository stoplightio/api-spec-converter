var parser = require('raml-1-parser');
var Endpoint = require('../entities/endpoint');
var Importer = require('./importer');
var Project = require('../entities/project');
var jsonHelper = require('../utils/json');
var ramlHelper = require('../helpers/raml');
var url = require('url');
var _ = require('lodash');

var toJSONOptions = {
	serializeMetadata: false
};
var parseOptions = {
	attributeDefaults: false
};

//TODO multi file support isn't justified

function RAML() {
  this.schemas = [];
}
RAML.prototype = new Importer();

RAML.prototype._getSecuritySchemeSettingsByName = function(schemeName) {
  var securitySchemes = this.data.securitySchemes;
  for(var i in securitySchemes) {
		if (!securitySchemes.hasOwnProperty(i)) continue;
	
		var entries = _.entries(securitySchemes[i]);
		for (var index = 0; index < entries.length; index += 1) {
			var entry = entries[index];
			var key = entry[0];
			var value = entry[1];
			
			if (schemeName === key) {
				return value;
			}
		}
  }
};

RAML.prototype._mapSecuritySchemes = function(securitySchemes) {
  var slSecurityScheme = {};
  for(var i in securitySchemes) {
    if (!securitySchemes.hasOwnProperty(i)) continue;
    var securityScheme = securitySchemes[i];
    for (var name in securityScheme) {
      if (!securityScheme.hasOwnProperty(name)) continue;
      var scheme = securityScheme[name];
      switch(scheme.type) {
        case 'OAuth 2.0':
          var oauth = {
            name: name, //not used in stoplight designer
            authorizationUrl: scheme.settings.authorizationUri || '',
            tokenUrl: scheme.settings.accessTokenUri || '',
            scopes: []
          };
          if (Array.isArray(scheme.scopes)) {
            for(var scopeIndex in scheme.scopes) {
              if (!scheme.scopes.hasOwnProperty(scopeIndex)) continue;
              oauth.scopes.push({
                name: scheme.scopes[scopeIndex],
                value: ''
              });
            }
          }
          //authorizationGrants are flow, only one supported in stoplight
          var flow = !_.isEmpty(scheme.settings.authorizationGrants) ? scheme.settings.authorizationGrants[0] : 'code';

          switch(flow) {
            case 'code':
              oauth.flow = 'accessCode';
              break;
            case 'token':
              oauth.flow = 'implicit';
              break;
            case 'owner':
              oauth.flow = 'application';
              break;
            case 'credentials':
              oauth.flow = 'password';
              break;
						default:
							break;
          }
          slSecurityScheme.oauth2 = oauth;
          break;
        case 'Basic Authentication':
          slSecurityScheme.basic = {
            name: name,
            value: '',
            description: scheme.description || ''
          };
          break;
        default:
          //TODO not supported
      }
    }
  }
  return slSecurityScheme;
};

RAML.prototype._mapRequestBody = function(methodBody) {
  return this.mapRequestBody(methodBody);
};

RAML.prototype._mapQueryString = function(queryParameters) {
  var queryString = {type:'object', properties: {}, required: []};
  for (var key in queryParameters) {
    if (!queryParameters.hasOwnProperty(key)) continue;
    var qp = queryParameters[key];
    queryString.properties[key] = ramlHelper.setParameterFields(qp, {});
    if (qp.required) {
      queryString.required.push(key);
    }
  }
  return queryString;
};

RAML.prototype._mapRequestHeaders = function(data) {
  return this._mapQueryString(data);
};

RAML.prototype._mapURIParams = function(uriParams) {
  var pathParams = {type:'object', properties: {}, required: []};

  for (var i in uriParams) {
    if (!uriParams.hasOwnProperty(i)) continue;
    var key = uriParams[i];

    pathParams.properties[key.name] = {
      description: key.displayName || key.description || '',
      type: key.type || 'string'
    };
  }
  return pathParams;
};

RAML.prototype._mapResponseBody = function(responses) {
	var data = [];
	for (var code in responses) {
		if (!responses.hasOwnProperty(code)) continue;
		var response = responses[code];
		var result = this._mapRequestBody(response.body);
		result.codes = [response.code];
		if (result.body) {
			result.body = jsonHelper.cleanSchema(result.body);
		}
		
		if (result.example) {
			result.example = jsonHelper.stringify(result.example, 4);
		}
		
		if (response.description) {
			result.description = response.description;
		}
		data.push(result);
	}
	return data;
};

RAML.prototype._mapSchema = function(schemData) {
  return this.mapSchema(schemData);
};

RAML.prototype.isValidRefValues = function(values) {
	if (!_.isArray(values)) {
		return this.isValidRefValue(values);
	}
	var result = true;
	for (var index = 0; index < values.length && result == true; index += 1) {
		result = this.isValidRefValue(values[index]);
	}
	
	return result;
};

RAML.prototype.isValidRefValue = function(value) {
	return typeof value === 'string' && ramlHelper.getScalarTypes.indexOf(value) < 0 && value !== 'object';
};

// from type=type1 to ref=type1
RAML.prototype.convertRefToModel = function(object) {
	for (var id in object) {
		if (!object.hasOwnProperty(id)) continue;
		if (id == 'type' && _.isArray(object[id]) && object[id].length == 1) {
			object[id] = object[id][0];
		}
		var val = object[id];
		if (!val) continue;
		
		if (id == 'type' && this.isValidRefValues(val)) {
			object.ref = val;
			delete object[id];
		} else if (typeof val === 'object') {
			if (val.type && val.type == 'date-only') {
				object[id] = {
					type: 'string',
					format: 'date'
				};
			} else if (val.type && val.type == 'datetime') {
				object[id] = {
					type: 'string',
					format: 'date-time'
				};
			} else if (id == 'structuredExample' || id == 'fixedFacets') { //delete garbage
				delete object[id];
			} else {
				object[id] = this.convertRefToModel(val);
			}
		} else if (id == 'name') { //delete garbage
			delete object[id];
		}
	}
	
	return object;
};

RAML.prototype.mapMimeTypes = function(body, skip) {
  var result = [];
  var skipMimeTypes = [];
  for (var i in skip) {
    if (skip[i].value) {
      skipMimeTypes.push(skip[i].value);
    }
  }

  for (var i in body) {
    var b = body[i];
    if (b.name) {
      var mimeType = b.name;
      if (skipMimeTypes.indexOf(mimeType) === -1) {
        result.push(mimeType);
      }
    }
  }
  return _.uniq(result);
};

RAML.prototype._mapEndpoint = function(resource, baseURI, pathParams) {
  if(resource.uriParameters) {
    pathParams = _.merge(pathParams, this._mapURIParams(resource.uriParameters));
  }

  var methods = resource.methods;
  for (var i in methods) {
    if (!methods.hasOwnProperty(i)) continue;
    var method = methods[i];
	
		var summary = method.summary ? method.summary : '';
		var endpoint = new Endpoint(summary);
		endpoint.Method = method.method;
		endpoint.Path = baseURI + resource.relativeUri;
		endpoint.Description = method.description ? method.description : '';
	
		endpoint.SetOperationId(method.displayName, endpoint.Method, endpoint.Path);

    if (method.body) {
      var c = this.mapMimeTypes(method.body, this.data.mediaType);
      endpoint.Consumes = c.length > 0 ? c : null;
      endpoint.Body = this._mapRequestBody(method.body);
    }

    if (method.queryParameters) {
      endpoint.QueryString = this._mapQueryString(method.queryParameters);
    }

    if (method.headers) {
      endpoint.Headers = this._mapRequestHeaders(method.headers);
    }

    if (method.responses) {
      var produces = [];
      for(var code in method.responses) {
        if (!method.responses[code] || !method.responses[code].body) {
          continue;
        }
        produces = produces.concat(this.mapMimeTypes(method.responses[code].body, this.data.mediaType));
      }
      var p = _.uniq(produces);
      endpoint.Produces = p.length > 0 ? p : null;
      endpoint.Responses = this._mapResponseBody(method.responses);
    }
	
		endpoint.traits = [];
		var isMethod = method.is;
		if (isMethod) {
			if (isMethod instanceof Array) {
				endpoint.traits = isMethod;
			} else if (isMethod instanceof Object) {
				endpoint.traits = Object.keys(isMethod);
			}
		}

    endpoint.PathParams = pathParams;

    //endpoint security
    var securedBy = method.securedBy;
    if (Array.isArray(securedBy)) {
      endpoint.securedBy = {};
      for(var si in securedBy) {
        if (!securedBy.hasOwnProperty(si)) continue;
	
				if (typeof securedBy[si] === 'string') {
					this._assignSecuredByToEndpoint(endpoint, securedBy[si]);
				} else {
					var entries = _.entries(securedBy[si]);
					
					for (var index = 0; index < entries.length; index += 1) {
						var entry = entries[index];
						this._assignSecuredByToEndpoint(endpoint,  entry[0]);
					}
				}
      }
    }

    //TODO endpoint security

    this.project.addEndpoint(endpoint);
  }

  var resources = resource.resources;
  if(resources && resources.length > 0) {
    for (var j = 0; j < resources.length; j += 1) {
      this._mapEndpoint(resources[j], baseURI + resource.relativeUri, pathParams);
    }
  }
};

RAML.prototype._assignSecuredByToEndpoint = function(endpoint, key) {
	var schemeSettings = this._getSecuritySchemeSettingsByName(key);
	switch(schemeSettings.type) {
		case 'OAuth 2.0':
			endpoint.securedBy.oauth2 = true;
			break;
		case 'Basic Authentication':
			endpoint.securedBy.basic = true;
			break;
		case 'Pass Through':
			endpoint.securedBy.apiKey = true;
			break;
		default:
			//TODO not supported
			break;
	}
};

RAML.prototype.loadFile = function(filePath, cb) {
	var me = this;
	parser.loadApi(filePath, parseOptions).then(function(api) {
		me.data = api.toJSON(toJSONOptions);
		cb();
	}, function(error) {
		cb(error);
	});
};

RAML.prototype.loadFileWithOptions = function(filePath, options, cb) {
	var me = this;
	parser.loadApi(filePath, _.merge(parseOptions, options)).then(function(api) {
		me.data = api.toJSON(toJSONOptions);
		cb();
	}, function(error) {
		cb(error);
	});
};


RAML.prototype.loadData = function(data, options) {
  var me = this;
  return new Promise(function(resolve, reject) {
    try {
			var parsedData = parser.parseRAMLSync(data, _.merge(parseOptions, options));
      if (parsedData.name === 'Error') {
        reject();
      } else {
				me.data = parsedData.toJSON(toJSONOptions);
        resolve();
      }
    } catch (e) {
      reject(e);
    }
  });
};

RAML.prototype._mapHost = function() {
	var parsedURL = url.parse(this.data.baseUri || '');
	this.project.Environment.Host = (parsedURL.protocol && parsedURL.host) ? (parsedURL.protocol + '//' + parsedURL.host) : null;
	this.project.Environment.BasePath = parsedURL.path;
};

RAML.prototype._mapTraits = function(traitGroups) {
  var slTraits = [];

  for (var i in traitGroups) {
    if (!traitGroups.hasOwnProperty(i)) continue;
    var traitGroup = traitGroups[i];
		
		for (var k in traitGroup) {
			if (!traitGroup.hasOwnProperty(k)) continue;
			var trait = traitGroup[k];
			var slTrait = {
					_id: k,
					name: k,
				description: '',
					request: {},
					responses: []
				};

			if (!_.isEmpty(trait.usage)) {
				slTrait.description = trait.usage;
			} else {
				delete slTrait.description;
			}
			
			if (trait.queryParameters) {
				slTrait.request.queryString = this._mapQueryString(trait.queryParameters);
			}
			
			if (trait.headers) {
				slTrait.request.headers = this._mapRequestHeaders(trait.headers);
			}
			
			if (trait.responses) {
				slTrait.responses = this._mapResponseBody(trait.responses);
			} else {
				delete slTrait.responses;
			}
			
			slTraits.push(slTrait);
		}
  }
  return slTraits;
};

RAML.prototype._import = function() {
    this.project = new Project(this.data.title);
    this.project.Environment.Version = this.data.version;
    if (!this.project.Environment.Version) {
      delete this.project.Environment.Version;
    }

    // TODO set project description from documentation
    // How to know which documentation describes the project briefly?
    this.description(this.project, this.data);

    this._mapHost();

    if (!_.isEmpty(this.data.protocols)) {
      this.project.Environment.Protocols = this.data.protocols;
      for (var i in this.project.Environment.Protocols) {
				if (!this.project.Environment.Protocols.hasOwnProperty(i)) continue;
        this.project.Environment.Protocols[i] = this.project.Environment.Protocols[i].toLowerCase();
      }
    }

    var mimeTypes = [];
    var mediaType = this.data.mediaType;
    if (mediaType) {
      if (!_.isArray(mediaType)) {
        mediaType = [mediaType];
      }
      for (var i in mediaType) {
				if (!mediaType.hasOwnProperty(i)) continue;
        if (mediaType[i]) {
          mimeTypes.push(mediaType[i]);
        }
      }
    }
    if (mimeTypes.length) {
      this.project.Environment.Produces = mimeTypes;
      this.project.Environment.Consumes = mimeTypes;
    }

    this.project.Environment.SecuritySchemes = this._mapSecuritySchemes(this.data.securitySchemes);

    var resources = this.data.resources;
    for (var i = 0; i < resources.length; i += 1) {
      this._mapEndpoint(resources[i], '', {});
    }

    var schemas = this._mapSchema(this.getSchema(this.data));
    for(var s in schemas) {
      if (!schemas.hasOwnProperty(s)) continue;
      this.project.addSchema(schemas[s]);
    }

    this.project.traits = this._mapTraits(this.data.traits);
};

RAML.prototype.description = function() { throw new Error('description method not implemented'); };

RAML.prototype.mapRequestBody = function() { throw new Error('mapRequestBody method not implemented'); };

RAML.prototype.mapSchema = function() { throw new Error('mapSchema method not implemented'); };

RAML.prototype.getSchema = function() { throw new Error('getSchema method not implemented'); };

module.exports = RAML;
