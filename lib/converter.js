var supportedFormats = ['postman']
var Postman = require('./mappers/postman')

function Converter(formatName) {
  if(supportedFormats.indexOf(formatName) < 0) {
    throw new Error('format not supported')
  }

  switch(formatName) {
    case 'postman':
    default:
      this.mapper = new Postman()
  }
}

Converter.prototype.load = function(jsonData) {
  this.mapper.loadData(jsonData)
}

Converter.prototype.getData = function() {
  return this.mapper.getRawData()
}

Converter.prototype.getSLEndpoints = function() {
  if(!this.mapper.getRawData()) {
    throw new Error('data not loaded for postman')
  }
  this.mapper.map()
  return this.mapper.getEndpoints()
}

module.exports = Converter
