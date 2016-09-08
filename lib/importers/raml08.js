var parser = require('raml-parser'),
    RAML = require('./baseraml'),
    Schema = require('../entities/schema'),
    jsonHelper = require('../utils/json'),
    YAML = require('js-yaml'),
    Endpoint = require('../entities/endpoint'),
    Project = require('../entities/project'),
    Text = require('../entities/text'),
    url = require('url'),
    _ = require('lodash');;

function RAML08() {}
RAML08.prototype = new RAML();

// UNCOMMENT BELOW WHEN RAML1 parser used

// RAML08.prototype.mapRequestBody = function(methodBody) {
//     var data = {body: {}, example: ''};

//     //TODO: only one, the latest is in effect in stoplight!
//     for (var i in methodBody) {
//         var mimeType = methodBody[i];

//         if (mimeType.example()) {
//             data.example = mimeType.example().value();
//         }

//         if (mimeType.formParameters()) {
//             data.body = {
//                 type: 'object',
//                 'properties': {},
//                 'required': []
//             };
//             var formParams = mimeType.formParameters();
//             for (var j in formParams) {
//                 var param = formParams[j];
//                 var definition = jsonHelper.parse(YAML.load(param.dump()));

//                 for (var paramId in definition) {
//                     var paramValue = definition[paramId];
//                     data.body.properties[paramId] = paramValue;

//                     if (paramValue.required && paramValue.required) {
//                         data.body.required.push(paramId);
//                     }
//                 }
//             }
//         }
//         if (mimeType.schema && mimeType.schema()) {
//             data.body = jsonHelper.parse(YAML.load(mimeType.dump())[mimeType.name()].schema);
//         }
//     }

//     return data;
// };

// RAML08.prototype.mapSchema = function(schemData) {
//     var schemas = [];
//     for (var i in schemData) {
//         var schema = schemData[i];
//         var schemaName = schema.key();
//         var sd = new Schema(schemaName);
//         sd.Name = schemaName;
//         sd.Definition = RAML08.prototype.convertRefAttFromObject(jsonHelper.parse(YAML.load(schema.dump())[schemaName]));

//         schemas.push(sd);
//     }
//     return schemas;
// };

RAML08.prototype.getSchema = function (data) {
    return data.schemas;
};

// GET RID OF BELOW WHEN RAML1 parser is used

RAML08.prototype._getSecuritySchemeSettingsByName = function(schemeName) {
  for(var i in this.data.securitySchemes) {
    var securityScheme = this.data.securitySchemes[i];
    for (var name in securityScheme) {
      if (name === schemeName) {
        return securityScheme[name];
      }
    }
  }
};

RAML08.prototype._mapQueryString = function(queryParameters) {
  var queryString = {type:'object', properties: {}, required: []};
  for (var key in queryParameters) {
    queryString.properties[key] = queryParameters[key];
    if (queryParameters[key].description) {
      queryString.properties[key].description = queryParameters[key].description;
    }
    if (queryParameters[key].required) {
      queryString.required.push(key);
    }
  }
  return queryString;
};

RAML08.prototype._mapURIParams = function (uriParams) {
  var pathParams = {type:'object', properties: {}, required: []};
  for (var key in uriParams) {
    pathParams.properties[key] = {
      description: uriParams[key].displayName || uriParams[key].description || '',
      type: uriParams[key].type || 'string'
    };
  }
  return pathParams;
};

RAML08.prototype._mapResponseBody = function(responses) {
  var data = [];
  for(var code in responses) {
    var response = responses[code];

    if (!response || !response.body || !response.body) {
      continue;
    }

    var result = this._mapRequestBody(response.body);
    result.codes = [code];
    result.body = jsonHelper.cleanSchema(result.body);

    if (!_.isEmpty(result.example)) {
      result.example = jsonHelper.stringify(result.example, 4);
    }

    if (response.description) {
      result.description = response.description;
    }
    data.push(result);
  }
  return data;
};

RAML08.prototype.mapMimeTypes = function(body, skip) {
  var result = [];

  var skipMimeTypes = typeof skip === 'string' ? [skip] : skip;
  for (var mimeType in body) {
    if (skipMimeTypes.indexOf(mimeType) === -1) {
      result.push(mimeType);
    }
  }
  return _.uniq(result);
};

RAML08.prototype._mapRequestBody = function (methodBody) {
  var data = {mimeType: '', body: {}, example: ''};

  //TODO: only one, the latest is in effect in stoplight!
  for (var mimeType in methodBody) {
    if (!methodBody[mimeType]) {
      continue;
    }
    data.mimeType = mimeType;

    if (!_.isEmpty(methodBody[mimeType].example)) {
      data.example = methodBody[mimeType].example;
    }

    if (methodBody[mimeType].schema) {
      var definition = jsonHelper.parse(methodBody[mimeType].schema);
      data.body = definition;
    }
    else if (methodBody[mimeType].formParameters) {
      data.body = {
          type: 'object',
          'properties': {},
          'required': []
      };
      var formParams = methodBody[mimeType].formParameters;
      for (var param in formParams) {
        data.body.properties[param] = {
          type: formParams[param].type
        };
        if (formParams[param].description) {
          data.body.properties[param].description = formParams[param].description;
        }
        if (formParams[param].required) {
          data.body.required.push(param);
        }
      }
    }
  }

  return data;
};

RAML08.prototype._mapSchema = function(schemData) {
  var schemas = [];
  for (var i in schemData) {
    for (var schemaName in schemData[i]) {
      var sd = new Schema(schemaName);
      sd.Name = schemaName;
      sd.Definition = jsonHelper.cleanSchema(schemData[i][schemaName]);
      schemas.push(sd);
    }
  }
  return schemas;
};

RAML08.prototype._mapEndpoint = function(resource, baseURI, pathParams) {
  if (resource.uriParameters && !_.isEmpty(resource.uriParameters)) {
    pathParams = _.merge(pathParams, this._mapURIParams(resource.uriParameters));
  }

  var methods = resource.methods;
  for (var i in methods) {
    var method = methods[i];

    var summary = method.name ? method.name : ''; // do we ever have a name or summary?
    var endpoint = new Endpoint(summary);
    endpoint.Method = method.method;
    endpoint.Path = baseURI + resource.relativeUri;
    endpoint.Description = method.description || '';

    endpoint.SetOperationId(method.displayName ? method.displayName : method.displayName, endpoint.Method, endpoint.Path);

    if (method.body) {
      var c = this.mapMimeTypes(method.body, this.data.mediaType);
      endpoint.Consumes = c.length > 0 ? c:null;
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
      endpoint.Produces = p.length > 0 ? p:null;

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
        var schemeSettings = this._getSecuritySchemeSettingsByName(securedBy[si].name);
        switch(schemeSettings.type) {
          case 'OAuth 2.0':
            endpoint.securedBy['oauth2'] = true;
            break;
          case 'Basic Authentication':
            endpoint.securedBy['basic'] = true;
            break;
          default:
            //TODO not supported
            break;
        }
      }
    }

    //TODO endpoint security

    this.project.addEndpoint(endpoint);
  }

  var resources = resource.resources;
  if(resources && resources.length > 0) {
    for (var i = 0; i < resources.length; i++) {
      this._mapEndpoint(resources[i], baseURI + resource.relativeUri, pathParams);
    }
  }
};

RAML08.prototype.loadFile = function (filePath, cb) {
  var me = this;

  parser.loadFile(filePath).then(function(api) {
    me.data = api;
    cb();
  }, function(error) {
    cb(error);
  });
};

RAML08.prototype.loadFileWithOptions = function (filePath, options, cb) {
  var me = this;

  parser.loadFile(filePath, options).then(function(api) {
    me.data = api;
    cb();
  }, function(error) {
    cb(error);
  });
};


RAML08.prototype.loadData = function (data) {
  var me = this;

  return new Promise(function(resolve, reject){
    parser.load(data)
    .then(function(data) {
      me.data = data;
      resolve();
    }, function(error) {
      reject(error);
    });
  });
};

RAML08.prototype._mapHost = function() {
  var parsedURL = url.parse(this.data.baseUri || '');
  this.project.Environment.Host = (parsedURL.protocol && parsedURL.host)? (parsedURL.protocol + '//' + parsedURL.host) : null;
  this.project.Environment.BasePath = parsedURL.path;
};

RAML08.prototype._mapTraits = function(traitGroups) {
  var slTraits = [];

  for (var i in traitGroups) {
    var traitGroup = traitGroups[i];

    for (var k in traitGroup) {
      var trait = traitGroup[k],
          slTrait = {
            _id: k,
            name: k,
            request: {},
            responses: []
          };

      if (trait.queryParameters) {
        slTrait.request.queryString = this._mapQueryString(trait.queryParameters);
      }

      if (trait.headers) {
        slTrait.request.headers = this._mapRequestHeaders(trait.headers);
      }

      if (trait.responses) {
        slTrait.responses = this._mapResponse(trait.responses);
      }

      slTraits.push(slTrait);
    }
  }

  return slTraits;
};

RAML08.prototype._import = function() {
  this.project = new Project(this.data.title);

  //TODO set project description from documentation
  //How to know which documentation describes the project briefly?
  var documentation = this.data.documentation;
  if (this.data.documentation && this.data.documentation.length > 0) {
    this.project.Description = this.data.documentation[0].content;
    this.project.Environment.summary = this.data.documentation[0].content;
  }

  this._mapHost();

  if (!_.isEmpty(this.data.protocols)) {
    this.project.Environment.Protocols = this.data.protocols;
  }

  this.project.Environment.Version = this.data.version;

  var mediaType = this.data.mediaType;
  var mimeTypes = [];
  // RAML1
  // for (var i in mediaType) {
  //   if (_.isFunction(mediaType[i].value)) {
  //     mimeTypes.push(mediaType[i].value);
  //   }
  // }
  if (!_.isEmpty(mediaType)) {
    mimeTypes.push(mediaType);
  }
  if (mimeTypes.length) {
    this.project.Environment.Produces = mimeTypes;
    this.project.Environment.Consumes = mimeTypes;
  }

  this.project.Environment.SecuritySchemes = this._mapSecuritySchemes(this.data.securitySchemes);

  var resources = this.data.resources;
  for (var i = 0; i < resources.length; i++) {
    this._mapEndpoint(resources[i], '', {});
  }

  var schemas = this._mapSchema(this.data.schemas);
  for(var i in schemas) {
    this.project.addSchema(schemas[i]);
  }

  this.project.traits = this._mapTraits(this.data.traits);

  // text sections
  if (this.data.documentation) {
    for (var i in this.data.documentation) {
      var doc = this.data.documentation[i];
      var txt = new Text(doc.title);
      txt.Public = true;
      txt.Content = doc.content;
      this.project.addText(txt);
    }
  }
};

// END GET RID OF THIS

module.exports = RAML08;
