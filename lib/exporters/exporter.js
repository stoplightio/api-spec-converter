
function Exporter() {
  this.data = null
  this.endpoints = []
  this.groups = []
}

Exporter.prototype.loadData = function (endpoints, groups) {
  this.endpoints = endpoints
  this.groups = groups
}

Exporter.prototype.map = function () {
  throw new Error('method not implemented')
}

Exporter.prototype.getData = function() {
  return this.data
}

module.exports = Exporter
