var Endpoint = require('../endpoint')
var Group = require('../group')
var raml = require('raml-parser')

function RAML() {
  this.data = null

  this.endpoints = []

  this.groups = []
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
    console.log(this.data.resources[i])
    return
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
