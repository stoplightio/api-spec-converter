var converter = require('./lib/converter')

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
}
