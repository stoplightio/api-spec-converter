var fs = require('fs'),
    Endpoint = require('../entities/endpoint'),
    Importer = require('./importer'),
    Project = require('../entities/project');


function Postman() {

}
Postman.prototype = new Importer();

function transformVariableFormat(val) {
  return val.replace(/\{\{(.*)\}\}/i, '<<$1>>');
}

function parseQuery(qstr) {
  var query = {};
  if (qstr && qstr.length > 0) {
    var a = qstr.substr(1).split('&');
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split('=');
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
  for(var key in data) {
    pathParams[key] = transformVariableFormat(data[key]);
  }
  return pathParams;
};

Postman.prototype._mapRequestHeaders = function(data) {
  var headerObj = {type: 'object', properties:{}, required:[]}, headers;
  headers = data.split('\n');
  for(var j in headers) {
    var header = headers[j];
    if(!header) {
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
    case 'params':
      //check for best suitability
      data.mimeType = 'multipart/form-data';
      break;
    default:
      data.mimeType = 'text/plain';
      break;
  }

  for(var j in requestData) {
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


Postman.prototype._mapEndpoint = function(pmr){
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
  var group = {
    groupName: folder.name,
    items: folder.order
  };
  return group;
}


Postman.prototype.loadFile = function (filePath, cb) {
  var data = fs.readFileSync(filePath, 'utf8');
  try {
    this.data = JSON.parse(data);
    cb();
  }
  catch(err) {
    cb(err);
  }
};

Postman.prototype._import = function() {
  this.project = new Project(this.data.name);
  this.project.Description = this.data.description;

  for (var i = 0; i < this.data.requests.length; i++) {
    this.project.addEndpoint(this._mapEndpoint(this.data.requests[i]));
  }

  for (var i = 0; i < this.data.folders.length; i++) {
    this.project.addGroup(mapEndpointGroup(this.data.folders[i]));
  }
};

module.exports = Postman;
