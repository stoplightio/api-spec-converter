var supportedFormats = ['postman', 'raml']
var Postman = require('./mappers/postman')
var RAML = require('./mappers/raml')


function Converter(formatName) {
  if(supportedFormats.indexOf(formatName) < 0) {
    throw new Error('format not supported')
  }

  switch(formatName) {
    case 'raml':
      this.mapper = new RAML()
      break
    case 'postman':
    default:
      this.mapper = new Postman()
  }
  this.mapper.type = formatName
}

Converter.prototype.load = function (rawData) {
  return this.mapper.loadData(rawData)
}

Converter.prototype.getData = function() {
  return this.mapper.getRawData()
}

Converter.prototype.getSLEndpoints = function() {
  if(!this.mapper.getRawData()) {
    throw new Error('data not loaded for ' + this.mapper.type)
  }
  this.mapper.map()
  return this.mapper.getEndpoints()
}

Converter.prototype.getSLEndpointGroups = function() {
  if(!this.mapper.getRawData()) {
    throw new Error('data not loaded for ' + this.mapper.type)
  }
  if (this.mapper.getEndpointGroups().length <= 0) {
    this.mapper.map()
  }
  return this.mapper.getEndpointGroups()
}

module.exports = Converter
