var YAML = require('json2yaml')

function Exporter() {
  this.data = null
  this.endpoints = []
  this.groups = []
  this.schemas = []
  this.project = null
}

Exporter.prototype.loadData = function (endpoints, groups) {
  this.endpoints = endpoints
  this.groups = groups
}

Exporter.prototype.loadProject = function (project) {
  this.project = project
}

Exporter.prototype._export = function () {
  throw new Error('method not implemented')
}

Exporter.prototype.export = function (format) {
  this._export()
  return this.getData(format)
}

Exporter.prototype.getData = function(format) {
  switch (format) {
    case 'yaml':
      return YAML.stringify(this.data)
    default:
      return this.data
  }
}

module.exports = Exporter
