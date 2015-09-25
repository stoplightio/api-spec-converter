
function Importer() {
  this.data = null
  this.endpoints = []
  this.groups = []
  this.schemas = []
}

Importer.prototype.loadFile = function (path) {
  throw new Error('method not implemented')
}

Importer.prototype.loadData = function (data) {
  this.data = data
}

Importer.prototype.map = function () {
  throw new Error('method not implemented')
}

Importer.prototype.getData = function() {
  return this.data
}

Importer.prototype.getEndpoints = function() {
  return this.endpoints
}

Importer.prototype.getEndpointGroups = function() {
  return this.groups
}

Importer.prototype.getSchemas = function() {
  return this.schemas
}

module.exports = Importer
