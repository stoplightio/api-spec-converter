var importers = {
  Postman: require('./importers/postman'),
  RAML: require('./importers/raml'),
  Swagger: require('./importers/swagger'),
  StopLight: require('./importers/stoplight')
}

var exporters = {
  Swagger: require('./exporters/swagger'),
  StopLight: require('./exporters/stoplight'),
  RAML: require('./exporters/raml'),
}

function Converter(fromFormat, toFormat) {
  if(!fromFormat || !fromFormat.name || !importers.hasOwnProperty(fromFormat.className)) {
    throw new Error('from format ' + fromFormat.name + ' not supported')
  }

  if(!toFormat || !toFormat.name || !exporters.hasOwnProperty(toFormat.className)) {
    throw new Error('to format ' + toFormat.name + ' not supported')
  }

  this.importer = new importers[fromFormat.className]()
  this.importer.type = fromFormat

  this.exporter = new exporters[toFormat.className]()
  this.exporter.type = toFormat
}

Converter.prototype.mapData = function() {
  if(!this.importer.getData()) {
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
