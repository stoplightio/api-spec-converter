var Endpoint = require('../endpoint')
var Group = require('../group')
var parser = require('swagger-parser')

function Swagger() {
  this.data = null
  this.metadata = null
  this.endpoints = []

  this.groups = []
}

Swagger.prototype.loadData = function (path) {
  var me = this
  return function(cb) {
    parser.parse(path, function(err, api, metadata) {
      if (err) {
        return console.log('error: ', err)
      }
      me.data = api
      me.metadata = metadata
      cb()
    })
  }
}

Swagger.prototype.map = function() {
  for (var path in this.data.paths) {
    var methods = this.data.paths[path]
    for (var method in methods) {
      if (method === 'parameters') {
        continue
      }
      var endpoint = new Endpoint(methods[method].description)
      endpoint.Path = path
      endpoint.Method = method

      //map request body

      //map response body

      //map path params

      //map query string

      //map headers

      this.endpoints.push(endpoint)
    }
  }
}

Swagger.prototype.getRawData = function() {
  return this.data
}

Swagger.prototype.getEndpoints = function() {
  return this.endpoints
}

Swagger.prototype.getEndpointGroups = function() {
  return this.groups
}

module.exports = Swagger
