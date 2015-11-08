
function Importer() {
  this.data = null
  this.endpoints = []
  this.groups = []
  this.schemas = []

  this.project = null
  this.mapped = false
}

Importer.prototype = {
  get Mapped() {
    return this.mapped
  },
  get IsDataLoaded() {
    return (this.data !== null)
  }
}

Importer.prototype.loadFile = function (path) {
  throw new Error('method not implemented')
}

Importer.prototype.loadData = function (data) {
  this.data = data
}

Importer.prototype.import = function () {
  throw new Error('method not implemented')
}

Importer.prototype.getData = function() {
  return this.data
}

Importer.prototype.getProject = function() {
  return this.project
}

module.exports = Importer
