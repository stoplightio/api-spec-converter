var parser = require('raml-parser'),
    Endpoint = require('../entities/endpoint'),
    Schema = require('../entities/schema'),
    Importer = require('./importer'),
    Project = require('../entities/project'),
    url = require('url');

//TODO multi file support isn't justified

function RAML() {
  this.schemas = [];
}
RAML.prototype = new Importer();

RAML.prototype._mapRequestBody = function (methodBody) {
  var data = {mimeType: '', body: {}, example: ''};

  for (var mimeType in methodBody) {
    data.mimeType = mimeType;

    if (!methodBody[mimeType]) {
      continue;
    }

    if (methodBody[mimeType].example) {
      data.example = methodBody[mimeType].example;
    }

    if (!methodBody[mimeType].schema) {
      continue;
    }

    var definition = JSON.parse(methodBody[mimeType].schema);
    //delete definition['$schema'];
    data.body = definition;
    /*if (definition['type'] && definition['type'] === 'object') {
      data.body['properties'] = {};
    }
    var requiredFileds = [];
    for (var key in definition) {
      if (typeof definition[key] === 'object') {
        for (var property in definition[key]) {
          data.body.properties[property] = definition[key][property];
          if (definition[key][property].required) {
            requiredFileds.push(property);
          }
          delete definition[key][property].required;
        }
      }
      else {
        if (key !== 'required') {
          data.body[key] = definition[key];
        }
        else if (definition[key] === true) {
          requiredFileds.push(key);
        }
      }
    }
    if (requiredFileds.length > 0) {
      data.body.required = requiredFileds;
    }*/
  }

  return data;
};

RAML.prototype._mapQueryString = function(queryParameters) {
  var queryString = {type:'object', properties: {}, required: []};
  for (var key in queryParameters) {
    queryString.properties[key] = queryParameters[key];
    if (queryParameters[key].required) {
      queryString.required.push(key);
    }
  }
  return queryString;
};

RAML.prototype._mapRequestHeaders = function (data) {
  return this._mapQueryString(data);
};

RAML.prototype._mapURIParams = function (uriParams) {
  var pathParams = uriParams;
  for (var key in pathParams) {
    pathParams[key].description = pathParams[key].displayName;
    delete pathParams[key].displayName;
    delete pathParams[key].type;
    delete pathParams[key].required;
  }
  return pathParams;
};

RAML.prototype._mapResponseBody = function(response) {
  var data = [];
  for(var code in response) {
    if (!response[code] || !response[code].body) {
      continue;
    }
    var result = this._mapRequestBody(response[code].body);
    result.codes = [code];
    result.body = JSON.stringify(result.body);
    data.push(result);
  }
  return data;
};

Importer.prototype._mapSchema = function(schemData) {
  var schemas = [];
  for (var i in schemData) {
    for (var schemaName in schemData[i]) {
      var sd = new Schema(schemaName);
      sd.Name = schemaName;
      sd.Definition = schemData[i][schemaName];
      schemas.push(sd);
    }
  }
  return schemas;
};


RAML.prototype._mapEndpoint = function(resource, baseURI) {

  var pathParams = {};
  if(resource.uriParameters) {
    pathParams = this._mapURIParams(resource.uriParameters);
  }

  for (var i = 0; i < resource.methods.length; i++) {
    var method = resource.methods[i];

    var name = '';
    if (method.displayName) {
      name = method.displayName;
    }

    var endpoint = new Endpoint(name);
    endpoint.Method = method.method;
    endpoint.Path = baseURI + resource.relativeUri;
    endpoint.Description = method.description;

    if (method.body) {
      endpoint.Body = this._mapRequestBody(method.body);
    }

    if (method.queryParameters) {
      endpoint.QueryString = this._mapQueryString(method.queryParameters);
    }

    if (method.headers) {
      endpoint.Headers = this._mapRequestHeaders(method.headers);
    }

    if (method.responses) {
      endpoint.Responses = this._mapResponseBody(method.responses);
    }

    endpoint.PathParams = pathParams;

    this.project.addEndpoint(endpoint);
  }

  if(resource.resources && resource.resources.length > 0) {
    for (var i = 0; i < resource.resources.length; i++) {
      this._mapEndpoint(resource.resources[i], baseURI + resource.relativeUri);
    }
  }
};

RAML.prototype.loadFile = function (filePath, cb) {
  var me = this;

  parser.loadFile(filePath).then(function(data) {
    me.data = data;
    cb();
  }, function(error) {
    cb(error);
  });
};

/*
RAML.prototype.loadData = function (data, cb) {
  parser.load(data).then(function(data) {
    cb();
  }, function(error) {
    cb(error);
  });
};*/

RAML.prototype._import = function() {
  this.project = new Project(this.data.title);

  //TODO set project description from documentation
  //How to know which documentation describes the project briefly?

  var parsedURL = url.parse(this.data.baseUri || 'http://localhost:3000');
  this.project.Environment.Host = parsedURL.protocol + '//' + parsedURL.host;
  this.project.Environment.BasePath = parsedURL.path || '';
  this.project.Environment.Protocols = this.data.protocols;
  this.project.Environment.DefaultResponseType = this.data.mediaType || '';
  this.project.Environment.DefaultRequestType = this.data.mediaType || '';
  this.project.Environment.Version = this.data.version;

  for (var i = 0; i < this.data.resources.length; i++) {
    this._mapEndpoint(this.data.resources[i], '');
  }

  var schemas = this._mapSchema(this.data.schemas);
  for(var i in schemas) {
    this.project.addSchema(schemas[i]);
  }
};

module.exports = RAML;
