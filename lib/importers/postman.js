var fs = require('fs');
var Endpoint = require('../entities/endpoint');
var SavedEntry = require('../entities/savedEntry');
var Importer = require('./importer');
var Project = require('../entities/project');
var urlHelper = require('../utils/url');
var jsonHelper = require('../utils/json');
var arrayHelper = require('../utils/array');
var _ = require('lodash');

function Postman() {

}
Postman.prototype = new Importer();

function transformVariableFormat(val) {
  if (!val) return null;
  return val.replace(/\{\{(.*)\}\}/i, '<<$1>>');
}

function parseQuery(qstr) {
	var a;
	var i;
	var b;
  var query = {};
  if (qstr && qstr.length > 0) {
    a = qstr.split('&');
    for (i in a) {
      b = a[i].split('=');
      if (!Array.isArray(b) || b.length <= 0) continue;
      query[decodeURIComponent(b[0])] = {
        type: 'string',
        default: transformVariableFormat(decodeURIComponent(b[1] || '')),
      };
    }
  }

  return {type: 'object', properties: query, required: []};
}

Postman.prototype._mapURIParams = function(data) {
  var pathParams = {};
	var key;
  for (key in data) {
    pathParams[key] = transformVariableFormat(data[key]);
  }
  return pathParams;
};

Postman.prototype._mapRequestHeaders = function(data) {
  var headerObj = {type: 'object', properties: {}, required: []};
	var headers;
	var j;
	var header;
	var keyValueParts;
  headers = data.split('\n');
  for (j in headers) {
    header = headers[j];
    if (!header) {
      continue;
    }
    keyValueParts = header.split(':');
    headerObj.properties[keyValueParts[0]] = {
      type: 'string',
      default: transformVariableFormat(keyValueParts[1]),
    };
  }
  return headerObj;
};

Postman.prototype._mapRequestBody = function(requestData) {
  var data = {body: {type: 'object', properties: {}, required: []}};
	var j;
	var type;

  for (j in requestData) {
    type = null;
    switch (requestData[j].type) {
      case 'text':
        type = 'string';
        break;
      default:
        type = 'binary';
    }
    data.body.properties[requestData[j].key] = {
      type: type,
      default: transformVariableFormat(requestData[j].value),
    };
  }
  return data;
};

function mapConsumes(mode) {
  var consumes = [];
  switch (mode) {
    case 'urlencoded':
      consumes.push('application/x-www-form-urlencoded');
      break;
    case 'params':
      // check for best suitability
      consumes.push('multipart/form-data');
      break;
    default:
      consumes.push('text/plain');
      break;
  }

  return consumes;
}

Postman.prototype._mapEndpoint = function(pmr) {
  var endpoint;
	var urlParts;
  endpoint = new Endpoint(pmr.name);
  endpoint.Id = pmr.id;
  urlParts = pmr.url.split('?');
  endpoint.QueryString = parseQuery(urlParts[1]);
  endpoint.Path = transformVariableFormat(urlParts[0]);
  endpoint.Method = pmr.method;

  endpoint.Before = pmr.preRequestScript;

  endpoint.PathParams = this._mapURIParams(pmr.pathVariables);

  // parse headers
  endpoint.Headers = this._mapRequestHeaders(pmr.headers);
  // TODO map Body
  endpoint.Consumes = mapConsumes(pmr.dataMode);
  endpoint.Body = this._mapRequestBody(pmr.data);
  return endpoint;
};

Postman.prototype.loadData = function(data) {
  var me = this;
  return new Promise((resolve, reject) => me._parseData(data, (err) => {
		if (err) {
			reject(err);
		} else {
			resolve();
		}
	}));
};

Postman.prototype._parseData = function(data, cb) {
  try {
    this.data = JSON.parse(data);
    cb();
  } catch (err) {
    cb(err);
  }
};

Postman.prototype.loadFile = function(filePath, cb) {
  var me = this;
	var data;

  if (urlHelper.isURL(filePath)) {
    urlHelper.get(filePath)
      .then(body => me._parseData(body, cb))
      .catch(cb);
  } else {
    data = fs.readFileSync(filePath, 'utf8');
    me._parseData(data, cb);
  }
};

Postman.prototype._mergeEndpointHeaders = function(endpoints) {
  return jsonHelper.stringify({
    type: 'object',
    properties: endpoints.reduce((result, endpoint) => _.merge(result,
			jsonHelper.parse(endpoint.Headers).properties), {}),
    required: [],
  }, 4);
};

Postman.prototype._mergeEndpointQueryString = function(endpoints) {
  return jsonHelper.stringify({
    type: 'object',
    properties: endpoints.reduce((result, endpoint) => _.merge(result,
			jsonHelper.parse(endpoint.QueryString).properties), {}),
    required: [],
  }, 4);
};

Postman.prototype._mergeEndpointGroups = function(endpoints) {
  var endpoint = endpoints[0];
	var headers;
	var queryString;

  if (endpoints.length <= 1) {
    return endpoint;
  }

  headers = this._mergeEndpointHeaders(endpoints);
  queryString = this._mergeEndpointQueryString(endpoints);

  endpoint.Name = endpoint.Path;
  endpoint.Headers = headers;
  endpoint.QueryString = queryString;

  // TODO maybe we should also merge pathParams and body

  return endpoint;
};

Postman.prototype._mergeEndpoints = function(endpoints) {
  var self = this;
  var groups = arrayHelper.groupBy(endpoints, endpoint => [endpoint.Path, endpoint.Method]);

  return groups.map(group => self._mergeEndpointGroups(group));
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
  savedEntry.Consumes = mapConsumes(pmr.dataMode);
  if (savedEntry.Method.toLowerCase() !== 'get' &&
      savedEntry.Method.toLowerCase() !== 'head') {
    savedEntry.Body = this._mapRequestBody(pmr.data);
  }

  return savedEntry;
};

Postman.prototype._import = function() {
  var self = this;
	var requests;
	var folders;
	var endpoints;

  this.project = new Project(this.data.name || '');
  this.project.Description = this.data.description || '';

  requests = this.data.requests || [];
  folders = this.data.folders || [];

  // TODO process only unique requests
  endpoints = requests.map(request => self._mapEndpoint(request));

  this._mergeEndpoints(endpoints).forEach(endpoint => self.project.addEndpoint(endpoint));

  requests.forEach(request => self.project.addSavedEntry(self._mapSavedEntry(request)));

  folders.forEach(folder => self.project.environment.resourcesOrder.savedEntries.push({
		_id: folder.id,
		name: folder.name,
		items: folder.order.map((item) => {
			return {
				type: 'savedEntries',
				_id: item,
			};
		}),
	}));

  // disable temporarily
  //  TODO
  /* for (var i = 0; i < this.data.folders.length; i++) {
   this.project.addEndpointGroup(mapEndpointGroup(this.data.folders[i]));
   } */
};

module.exports = Postman;
