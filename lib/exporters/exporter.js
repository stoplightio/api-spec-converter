var YAML = require('json2yaml')

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

Exporter.prototype.getData = function(format) {
  switch (format) {
    case 'yaml':
      return YAML.stringify(this.data)
    default:
      return this.data
  }
}

module.exports = Exporter
