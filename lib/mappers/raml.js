var Endpoint = require('../endpoint')
var Group = require('../group')
var raml = require('raml-parser')

function RAML() {
  this.data = null

  this.endpoints = []

  this.groups = []
}

RAML.prototype.mapBody = function(methodBody) {
  var data = {body: {}, example: ''}

  for (var mimeType in methodBody) {
    var definition = JSON.parse(methodBody[mimeType].schema)
    if (methodBody[mimeType].example) {
      data.example =methodBody[mimeType].example
    }
    delete definition['$schema']
    data.mimeType = mimeType

    if (definition['type'] && definition['type'] === 'object') {
      data.body['properties'] = {}
    }
    var requiredFileds = []
    for (var key in definition) {
      if (typeof definition[key] === 'object') {
        for (var property in definition[key]) {
          data.body.properties[property] = definition[key][property]
          if (definition[key][property].required) {
            requiredFileds.push(property)
          }
          delete definition[key][property].required
        }
      }
      else {
        if (key !== 'required') {
          data.body[key] = definition[key]
        }
        else if (definition[key] === true) {
          requiredFileds.push(key)
        }
      }
    }
    data.body.required = requiredFileds
  }

  return data
}

RAML.prototype.mapQueryStringOrHeader = function(queryParameters) {
  var queryString = {type:'object', properties: {}, required: []}
  for (var key in queryParameters) {
    queryString.properties[key] = queryParameters[key]
    if (queryParameters[key].required) {
      queryString.required.push(key)
    }
    delete queryParameters[key].required
  }
  return queryString
}

RAML.prototype.mapURIParams = function(uriParams) {
  var pathParams = uriParams
  for (var key in pathParams) {
    pathParams[key].description = pathParams[key].displayName
    delete pathParams[key].displayName
    delete pathParams[key].type
    delete pathParams[key].required
  }
  return pathParams
}


RAML.prototype.createEndpoint = function(me, resource, baseURI) {

  var pathParams = {}
  if(resource.uriParameters) {
    pathParams = this.mapURIParams(resource.uriParameters)
  }

  for (var i = 0; i < resource.methods.length; i++) {
    var method = resource.methods[i]
    var endpoint = new Endpoint(method.description)
    endpoint.Method = method.method
    endpoint.Path = baseURI + resource.relativeUri

    //TODO example/responses/protocol

    if (method.body) {
      endpoint.Body = this.mapBody(method.body)
    }

    if (method.queryParameters) {
      endpoint.QueryString = this.mapQueryStringOrHeader(method.queryParameters)
    }

    if (method.headers) {
      endpoint.Headers = this.mapQueryStringOrHeader(method.headers)
    }

    endpoint.PathParams = pathParams

    endpoint.ItemId = me.endpoints.length
    me.endpoints.push(endpoint)
  }

  if(resource.resources && resource.resources.length > 0) {
    for (var i = 0; i < resource.resources.length; i++) {
      me.createEndpoint(me, resource.resources[i], baseURI + resource.relativeUri)
    }
  }
}

RAML.prototype.loadData = function (rawData) {
  var me = this
  return function(cb) {
    raml.load(rawData).then(function(data) {
      me.data = data
      cb()
    }, function(error) {
      console.log('Error parsing: ' + error)
      cb()
    })
  }
}

RAML.prototype.map = function() {
  for (var i = 0; i < this.data.resources.length; i++) {
    this.createEndpoint(this, this.data.resources[i], '')
  }
}

RAML.prototype.getRawData = function() {
  return this.data
}

RAML.prototype.getEndpoints = function() {
  return this.endpoints
}

RAML.prototype.getEndpointGroups = function() {
  return this.groups
}

module.exports = RAML
