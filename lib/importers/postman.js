var fs = require('fs'),
    Endpoint = require('../entities/endpoint'),
    SavedEntry = require('../entities/savedEntry'),
    Importer = require('./importer'),
    Project = require('../entities/project'),
    urlHelper = require('../utils/url'),
    jsonHelper = require('../utils/json'),
    arrayHelper = require('../utils/array'),
    _ = require('lodash');

function Postman() {

}
Postman.prototype = new Importer();

function transformVariableFormat(val) {
  if (!val) return null;
  return val.replace(/\{\{(.*)\}\}/i, '<<$1>>');
}

function parseQuery(qstr) {
  var query = {};
  if (qstr && qstr.length > 0) {
    var a = qstr.split('&');
    for (var i in a) {
      var b = a[i].split('=');
      if (!Array.isArray(b) || b.length <= 0)continue;
      query[decodeURIComponent(b[0])] = {
        type: 'string',
        default: transformVariableFormat(decodeURIComponent(b[1] || ''))
      };
    }
  }

  return {type: 'object', properties: query, required: []};
}

Postman.prototype._mapURIParams = function(data) {
  var pathParams = {};
  for (var key in data) {
    pathParams[key] = transformVariableFormat(data[key]);
  }
  return pathParams;
};

Postman.prototype._mapRequestHeaders = function(data) {
  var headerObj = {type: 'object', properties: {}, required: []}, headers;
  headers = data.split('\n');
  for (var j in headers) {
    var header = headers[j];
    if (!header) {
      continue;
    }
    var keyValueParts = header.split(':');
    headerObj['properties'][keyValueParts[0]] = {
      type: 'string',
      default: transformVariableFormat(keyValueParts[1])
    };
  }
  return headerObj;
};

Postman.prototype._mapRequestBody = function(mode, requestData) {
  var data = {body: {type: 'object', properties: {}, required: []}};
  //TODO map Body
  switch (mode) {
    case 'urlencoded':
      data.mimeType = 'application/x-www-form-urlencoded';
      break;
    case 'params':
      //check for best suitability
      data.mimeType = 'multipart/form-data';
      break;
    default:
      data.mimeType = 'text/plain';
      break;
  }

  for (var j in requestData) {
    var type = null;
    switch (requestData[j].type) {
      case 'text':
        type = 'string';
        break;
      default:
        type = 'binary';
    }
    data.body.properties[requestData[j].key] = {
      'type': type,
      'default': transformVariableFormat(requestData[j].value)
    };
  }
  return data;
};

Postman.prototype._mapEndpoint = function(pmr) {
  var endpoint, headers, v, queryString, urlParts;
  endpoint = new Endpoint(pmr.name);
  endpoint.Id = pmr.id;
  urlParts = pmr.url.split('?');
  endpoint.QueryString = parseQuery(urlParts[1]);
  endpoint.Path = transformVariableFormat(urlParts[0]);
  endpoint.Method = pmr.method;

  endpoint.Before = pmr.preRequestScript;

  endpoint.PathParams = this._mapURIParams(pmr.pathVariables);

  //parse headers
  endpoint.Headers = this._mapRequestHeaders(pmr.headers);

  endpoint.Body = this._mapRequestBody(pmr.dataMode, pmr.data);
  return endpoint;
};

function mapEndpointGroup(folder) {
  return {
    name: folder.name,
    items: folder.order
  };
}

Postman.prototype.loadData = function(data) {
  var me = this;
  return new Promise(function(resolve, reject) {
    me._parseData(data, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

Postman.prototype._parseData = function(data, cb) {
  try {
    this.data = JSON.parse(data);
    cb();
  }
  catch (err) {
    cb(err);
  }
};

Postman.prototype.loadFile = function(filePath, cb) {
  var me = this;

  if (urlHelper.isURL(filePath)) {
    urlHelper.get(filePath)
      .then(function(body) {
        me._parseData(body, cb);
      })
      .catch(cb);
  } else {
    var data = fs.readFileSync(filePath, 'utf8');
    me._parseData(data, cb);
  }
};

Postman.prototype._mergeEndpointHeaders = function(endpoints) {
  return jsonHelper.stringify({
    type: 'object',
    properties: endpoints.reduce(function(result, endpoint) {
      return _.merge(result,
        jsonHelper.parse(endpoint.Headers).properties);
    }, {}),
    required: []
  }, 4);
};

Postman.prototype._mergeEndpointQueryString = function(endpoints) {
  return jsonHelper.stringify({
    type: 'object',
    properties: endpoints.reduce(function(result, endpoint) {
      return _.merge(result,
        jsonHelper.parse(endpoint.QueryString).properties);
    }, {}),
    required: []
  }, 4);
};

Postman.prototype._mergeEndpointGroups = function(endpoints) {
  var endpoint = endpoints[0];

  if (endpoints.length <= 1) {
    return endpoint;
  }

  var headers = this._mergeEndpointHeaders(endpoints);
  var queryString = this._mergeEndpointQueryString(endpoints);

  endpoint.Name = endpoint.Path;
  endpoint.Headers = headers;
  endpoint.QueryString = queryString;

  // TODO maybe we should also merge pathParams and body

  return endpoint;
};

Postman.prototype._mergeEndpoints = function(endpoints) {
  var self = this;
  var groups = arrayHelper.groupBy(endpoints, function(endpoint) {
    return [endpoint.Path, endpoint.Method];
  });

  return groups.map(function(group) {
    return self._mergeEndpointGroups(group);
  });
};

Postman.prototype._mapSavedEntry = function(pmr) {
  var savedEntry = new SavedEntry(pmr.name);
  var urlParts = pmr.url.split('?');

  savedEntry.Id = pmr.id;
  savedEntry.QueryString = parseQuery(urlParts[1]);
  savedEntry.Path = transformVariableFormat(urlParts[0]);
  savedEntry.Method = pmr.method;
  savedEntry.PathParams = this._mapURIParams(pmr.pathVariables);
  savedEntry.Headers = this._mapRequestHeaders(pmr.headers);

  if (savedEntry.Method.toLowerCase() !== 'get' &&
      savedEntry.Method.toLowerCase() !== 'head') {
    savedEntry.Body = this._mapRequestBody(pmr.dataMode, pmr.data);
  }

  return savedEntry;
};

Postman.prototype._import = function() {
  var self = this;

  this.project = new Project(this.data.name || '');
  this.project.Description = this.data.description || '';

  var requests = this.data.requests || [];
  var folders = this.data.folders || [];

  // TODO process only unique requests
  var endpoints = requests.map(function(request) {
    return self._mapEndpoint(request);
  });

  this._mergeEndpoints(endpoints).forEach(function(endpoint) {
    self.project.addEndpoint(endpoint);
  });

  requests.map(function(request) {
    self.project.addSavedEntry(self._mapSavedEntry(request));
  });

  folders.forEach(function(folder) {
    self.project.environment.resourcesOrder.savedEntries.push({
      _id: folder.id,
      name: folder.name,
      items: folder.order.map(function(item) {
        return {
          type: 'savedEntries',
          _id: item
        };
      })
    });
  });

  //disable temporarily
  //TODO
  /*for (var i = 0; i < this.data.folders.length; i++) {
   this.project.addEndpointGroup(mapEndpointGroup(this.data.folders[i]));
   }*/
};

module.exports = Postman;
