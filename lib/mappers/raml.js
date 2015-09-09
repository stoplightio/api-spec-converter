var Endpoint = require('../endpoint')
var Group = require('../group')
var raml = require('raml-parser')

function RAML() {
  this.data = null

  this.endpoints = []

  this.groups = []
}

RAML.prototype.createEndpoint = function(me, resource, baseURI) {
  for (var i = 0; i < resource.methods.length; i++) {
    var method = resource.methods[i]
    var endpoint = new Endpoint(method.description)
    endpoint.Method = method.method
    endpoint.Path = baseURI + resource.relativeUri

    //TODO example/responses/protocol

    if (method.body) {
      //console.log(JSON.parse(method.body['application/json'].schema))
      var data = {body: {}, example: ''}
      for (var mimeType in method.body) {
        var definition = JSON.parse(method.body[mimeType].schema)
        if (method.body[mimeType].example) {
          data.example = method.body[mimeType].example
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
      endpoint.Body = data
    }

    var queryString = {type:'object', properties: {}, required: []}
    if (method.queryParameters) {
      for (var key in method.queryParameters) {
        queryString.properties[key] = method.queryParameters[key]

        if (method.queryParameters[key].required) {
          queryString.required.push(key)
        }
        delete method.queryParameters[key].required
      }
      endpoint.QueryString = queryString
    }

    //TODO URI params support

    endpoint.ItemId = me.endpoints.length
    me.endpoints.push(endpoint)
  }

  if(resource.resources && resource.resources.length > 0) {
    for (var i = 0; i < resource.resources.length; i++) {
      me.createEndpoint(me, resource.resources[i], baseURI + resource.relativeUri)
    }
  }
}

RAML.prototype.loadData = function* (rawData, cb) {
  var me = this
  raml.load(rawData).then(function(data) {
    me.data = data
    return true
  }, function(error) {
    console.log('Error parsing: ' + error)
    return false
  })
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
