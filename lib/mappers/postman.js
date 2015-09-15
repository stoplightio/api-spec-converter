var Endpoint = require('../endpoint')
var Group = require('../group')
var fs = require('fs')

function Postman() {
  this.data = null

  this.endpoints = []

  this.groups = []
}

function transformVariableFormat(val) {
  return val.replace(/\{\{(.*)\}\}/i, "<<$1>>")
}

function parseQuery(qstr) {
  var query = {}
  if (qstr && qstr.length > 0) {
    var a = qstr.substr(1).split('&')
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split('=')
        query[decodeURIComponent(b[0])] = {
          type: 'string',
          default: transformVariableFormat(decodeURIComponent(b[1] || ''))
        }
    }
  }

  return {type: 'object', properties: query, required: []}
}

Postman.prototype.mapEndpoint = function(pmr) {
  var endpoint, headers, headerObj = {}, queryString, urlParts
  endpoint = new Endpoint(pmr.name)
  endpoint.ItemId = pmr.id
  urlParts = pmr.url.split('?')
  endpoint.QueryString = parseQuery(urlParts[1])
  endpoint.Path = transformVariableFormat(urlParts[0])
  endpoint.Method = pmr.method

  endpoint.Before = pmr.preRequestScript

  for(var key in pmr.pathVariables) {
    pmr.pathVariables[key] = transformVariableFormat(pmr.pathVariables[key])
  }

  endpoint.PathParams = pmr.pathVariables

  //parse headers
  headers = pmr.headers.split('\n')
  for(var j in headers) {
    var header = headers[j]
    if(!header) {
      continue
    }
    var keyValueParts = header.split(':')
    headerObj[keyValueParts[0]] = transformVariableFormat(keyValueParts[1])
  }
  endpoint.Headers = headerObj

  var data = {body: {type: 'object', properties: {}}}
  //TODO map Body
  switch (pmr.dataMode) {
    case 'urlencoded':
      data.mimeType = 'application/x-www-form-urlencoded'
    case 'params':
      //check for best suitability
      data.mimeType = 'multipart/form-data'
      break
    default:
      data.mimeType = 'text/plain'
      break
  }

  for(var j in pmr.data) {
    data.body.properties[pmr.data[j].key] = {
      'type': pmr.data[j].type,
      'default': transformVariableFormat(pmr.data[j].value)
    }
  }

  endpoint.Body = data
  return endpoint
}

Postman.prototype.mapEndpointGroup = function(folder) {
  group = new Group(folder.name)
  group.Items = folder.order
  this.groups.push(group)
}


Postman.prototype.loadFile = function (filePath) {
  var data = fs.readFileSync(filePath, 'utf8')
  return this.data = JSON.parse(data)
}

Postman.prototype.map = function() {

  for (var i = 0; i < this.data.requests.length; i++) {
    this.endpoints.push(this.mapEndpoint(this.data.requests[i]))
  }

  for (var i = 0; i < this.data.folders.length; i++) {
    this.mapEndpointGroup(this.data.folders[i])
  }
}

Postman.prototype.getRawData = function() {
  return this.data
}

Postman.prototype.getEndpoints = function() {
  return this.endpoints
}

Postman.prototype.getEndpointGroups = function() {
  return this.groups
}

module.exports = Postman
