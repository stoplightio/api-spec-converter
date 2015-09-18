
function Importer() {
  this.data = null
  this.endpoints = []
  this.groups = []
}

Importer.prototype.loadFile = function (path) {
  throw new Error('method not implemented')
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

module.exports = Importer
