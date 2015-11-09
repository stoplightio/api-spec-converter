var converter = require('./lib/converter')
var Importer = require('./lib/importers/index')
var Exporter = require('./lib/exporters/index')


var supportedFormats = {
  'POSTMAN': {
    name: 'Postman',
    className: 'Postman'
  },
  'RAML':  {
    name: 'RAML',
    className: 'RAML'
  },
  'SWAGGER': {
    name: 'Swagger',
    className: 'Swagger'
  },
  'STOPLIGHT': {
    name: 'StopLight',
    className: 'StopLight'
  }
}

module.exports = {
  Converter: converter.Converter,
  Formats: supportedFormats,
  Importer: Importer,
  Exporter: Exporter
}
