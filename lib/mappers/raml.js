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
      var data = {body: {type: 'object', properties: {}}}
      for (var key in method.body) {
        var definition = JSON.parse(method.body[key].schema)
        //TODO parse properly
        data.body.properties = definition
      }
      endpoint.Body = data
    }
    endpoint.ItemId = me.endpoints.length
    me.endpoints.push(endpoint)
  }

  if(resource.resources && resource.resources.length > 0) {
    for (var i = 0; i < resource.resources.length; i++) {
      me.createEndpoint(me, resource.resources[i], baseURI + resource.relativeUri)
    }
  }
}

RAML.prototype.loadData = function(fileName, cb) {
  var me = this
  raml.loadFile(fileName).then(function(data) {
    me.data = data
    cb()
  }, function(error) {
    console.log('Error parsing: ' + error)
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
