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
      responses: {
        'default': {}
      },
      parameters: parameters
    }

  }
  this.data = swaggerDef
}

module.exports = Swagger
