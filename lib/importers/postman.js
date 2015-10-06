var fs = require('fs'),
    Endpoint = require('../entities/endpoint'),
    Group = require('../entities/group'),
    Importer = require('./importer'),
    Project = require('../entities/project')


function Postman() {

}
Postman.prototype = new Importer()

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

function mapPathParams(data) {
  var pathParams = {}
  for(var key in data) {
    pathParams[key] = transformVariableFormat(data[key])
  }
  return pathParams
}

function mapHeaders(data) {
  var headerObj = {"type": "object", properties:{}, required:[]}, headers
  headers = data.split('\n')
  for(var j in headers) {
    var header = headers[j]
    if(!header) {
      continue
    }
    var keyValueParts = header.split(':')
    headerObj['properties'][keyValueParts[0]] = {
      type: 'string',
      default: transformVariableFormat(keyValueParts[1])
    }
  }
  return headerObj
}

function mapRequestBody(mode, requestData) {
  var data = {body: {type: 'object', properties: {}, required: []}}
  //TODO map Body
  switch (mode) {
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

  for(var j in requestData) {
    var type = null
    switch (requestData[j].type) {
      case 'text':
        type = 'string'
        break
      default:
        type = 'binary'
    }
    data.body.properties[requestData[j].key] = {
      'type': type,
      'default': transformVariableFormat(requestData[j].value)
    }
  }
  return data
}


function mapEndpoint(pmr) {
  var endpoint, headers, v, queryString, urlParts
  endpoint = new Endpoint(pmr.name)
  endpoint.ItemId = pmr.id
  urlParts = pmr.url.split('?')
  endpoint.QueryString = parseQuery(urlParts[1])
  endpoint.Path = transformVariableFormat(urlParts[0])
  endpoint.Method = pmr.method

  endpoint.Before = pmr.preRequestScript

  endpoint.PathParams = mapPathParams(pmr.pathVariables)

  //parse headers
  endpoint.Headers = mapHeaders(pmr.headers)

  endpoint.Body = mapRequestBody(pmr.dataMode, pmr.data)
  return endpoint
}

function mapEndpointGroup(folder) {
  group = new Group(folder.name)
  group.Items = folder.order
  return group
}


Postman.prototype.loadFile = function (filePath) {
  var data = fs.readFileSync(filePath, 'utf8')
  return this.data = JSON.parse(data)
}

Postman.prototype.map = function() {
  this.project = new Project(this.data.name)
  this.project.Description = this.data.description

  for (var i = 0; i < this.data.requests.length; i++) {
    this.project.addEndpoint(mapEndpoint(this.data.requests[i]))
  }

  for (var i = 0; i < this.data.folders.length; i++) {
    this.project.addGroup(mapEndpointGroup(this.data.folders[i]))
  }

  //set mapped flag
  this.mapped = true
}

module.exports = Postman
