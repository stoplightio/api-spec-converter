var Postman = require('./mappers/postman'),
    RAML = require('./mappers/raml'),
    Swagger = require('./mappers/swagger'),
    StopLight = require('./mappers/stoplight')

var supportedFormats = {
  'POSTMAN': {
    name: 'Postman',
    className: Postman
  },
  'RAML':  {
    name: 'RAML',
    className: RAML
  },
  'SWAGGER': {
    name: 'Swagger',
    className: Swagger
  },
  'STOPLIGHT': {
    name: 'StopLight',
    className: StopLight
  }
}

function Converter(fromFormat, toFormat) {
  if(!fromFormat || !fromFormat.name) {
    throw new Error('from format ' + fromFormat.name + ' not supported')
  }

  if(!toFormat || !toFormat.name) {
    throw new Error('to format ' + toFormat.name + ' not supported')
  }

  this.mapper = new fromFormat.className
  this.mapper.type = fromFormat

  this.mappee = new toFormat.className
  this.mappee.type = toFormat
}

Converter.prototype.mapData = function() {
  if(!this.mapper.getData()) {
    throw new Error('data not loaded for ' + this.mapper.type)
  }

  if (this.mapper.getEndpoints().length <= 0 && this.mapper.getEndpointGroups().length <= 0) {
    this.mapper.map()
  }
}

Converter.prototype.loadFile = function (rawData) {
  return this.mapper.loadFile(rawData)
}

Converter.prototype.getSLEndpoints = function() {
  this.mapData()
  return this.mapper.getEndpoints()
}

Converter.prototype.getSLEndpointGroups = function() {
  this.mapData()
  return this.mapper.getEndpointGroups()
}

Converter.prototype.getMappedData = function () {
  this.mapData()
  this.mappee.setEndpoints(this.mapper.getEndpoints())
  this.mappee.setEndpointGroups(this.mapper.getEndpointGroups())
  this.mappee.mapFrom()
  return this.mappee.getData()
}

Converter.prototype.getMapper = function () {
  return this.mapper
}

Converter.prototype.getMappee = function () {
  return this.mappee
}

exports.Formats = supportedFormats
exports.Converter = Converter
