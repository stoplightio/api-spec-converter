var Endpoint = require('../endpoint'),
    Exporter = require('./exporter'),
    SwaggerParser = require('swagger-parser')



function SwaggerDefinition() {
  this.swagger = "2.0"
  this.info = {
    "version": "1.0.0",
    "title": "",
    "description": ""
  }

  this.paths = {}

  this.definitions = {}
}



function Swagger() {
  this.metadata = null
}

Swagger.prototype = new Exporter()


function mapPathParams(pathParams) {
  var parameters = []
  for (var paramName in pathParams) {
    var param = pathParams[paramName]
    param.name = paramName
    param.in = 'path'
    param.required = true
    parameters.push(param)
  }
  return parameters
}

function mapQueryString(queryStringParams) {
  var parameters = []
  for (var paramName in queryStringParams.properties) {
    var param = queryStringParams.properties[paramName]
    param.name = paramName
    param.in = 'query'
    if (queryStringParams.required.indexOf(param.name) > 0) {
      param.required = true
    }
    parameters.push(param)
  }
  return parameters
}

function mapResponses(slResponses) {
  var result = {}
  for(var i in slResponses) {
    var res = slResponses[i], item = {description: ""}
    if (res.body !== '{}' && res.body.length > 2) {
      item.schema = JSON.parse(res.body)
    }
    if (res.example && res.example !== '{}' && res.example.length > 2) {
      item.examples = {}
      item.examples[res.mimeType] = JSON.parse(res.example)
    }
    result[(res.codes[0] === 400?'default':res.codes[0])] = item
  }
  return result
}

Swagger.prototype.map = function () {
  //TODO
  var swaggerDef = new SwaggerDefinition()
  for(var i in this.endpoints) {

    var endpoint = this.endpoints[i], parameters = []

    if (!swaggerDef.paths[endpoint.Path]) {
      swaggerDef.paths[endpoint.Path] = {
         parameters: mapPathParams(endpoint.PathParams)
      }
    }
    parameters = parameters.concat(mapQueryString(endpoint.QueryString))
    swaggerDef.paths[endpoint.Path][endpoint.Method] = {
      responses: mapResponses(endpoint.Responses),
      parameters: parameters
    }

  }
  this.data = swaggerDef
}

module.exports = Swagger
