var Importers = require('./importers/index')
var Exporters = require('./exporters/index')

function Converter(fromFormat, toFormat) {
  this.importer = Importers.factory(fromFormat)
  if (!this.importer) {
    throw new Error('from format ' + fromFormat.name + ' not supported')
  }
  this.importer.type = fromFormat

  this.exporter = Exporters.factory(toFormat)
  if (!this.exporter) {
    throw new Error('to format ' + toFormat.name + ' not supported')
  }
  this.exporter.type = toFormat
}

Converter.prototype.mapData = function() {
  if(!this.importer.IsDataLoaded) {
    throw new Error('data not loaded for ' + this.importer.type)
  }

  if (!this.importer.Mapped) {
    this.importer.import()
  }
}

Converter.prototype.loadFile = function (filePath, cb) {
  return this.importer.loadFile(filePath, cb)
}

Converter.prototype.loadData = function (rawData) {
  return this.importer.loadData(rawData)
}

Converter.prototype.getImportedProject = function() {
  this.mapData()
  return this.importer.getProject()
}

Converter.prototype.getConvertedData = function (format) {
  this.mapData()
  this.exporter.loadProject(this.importer.getProject())
  this.exporter.export()
  return this.exporter.getData(format)
}

Converter.prototype.getImporter = function () {
  return this.importer
}

Converter.prototype.getExpoerter = function () {
  return this.exporter
}

exports.Converter = Converter
