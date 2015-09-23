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
    param.type = 'string'
    parameters.push(param)
  }
  return parameters
}

function mapQueryString(queryStringParams) {
  var parameters = []
  if (!queryStringParams.properties) {
    return parameters
  }
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
    if (res.body && res.body !== '{}' && res.body.length > 2) {
      item.schema = JSON.parse(res.body)
    }
    if (res.example && res.example !== '{}' && res.example.length > 2) {
      item.examples = {}
      item.examples[res.mimeType] = JSON.parse(res.example)
    }
    result[((res.codes && res.codes.length > 0)?res.codes[0]:'default')] = item
  }
  return result
}

function mapResponseTypes(slResponses) {
  var result = []
  for(var i in slResponses) {
    var res = slResponses[i]
    if (res.mimeType) {
      result.push(res.mimeType)
    }
  }
  return result
}

function mapRequestBody(slRequestBody) {
  var result = [], body = JSON.parse(slRequestBody.body)
  for (var property in body.properties) {
    //var param = body.properties[property]
    var param = {}
    param.type = "string"
    param.name = property
    if (body.properties[property].type === 'object') {
      //it would pass with json-schema validation disabled
      param.in = 'body'
      param.schema = body.properties[property]
    }
    else {
      param.in = 'formData'
    }
    if(body.required && body.required.indexOf(property) > 0) {
      param.required = true
    }
    else {
      param.required = false
    }
    param.description = ""
    result.push(param)
  }
  return result
}

function mapRequestHeaders(slHeaders) {
  var result = []

  for(var property in slHeaders.properties) {
    var param = slHeaders.properties[property]
    param.name = property
    param.in = 'header'
    result.push(param)
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
    parameters = parameters.concat(mapRequestBody(endpoint.Body))
    parameters = parameters.concat(mapRequestHeaders(endpoint.Headers))
    swaggerDef.paths[endpoint.Path][endpoint.Method] = {
      responses: mapResponses(endpoint.Responses),
      parameters: parameters,
      consumes: [endpoint.Body.mimeType],
      produces: mapResponseTypes(endpoint.Responses)
    }

  }
  this.data = swaggerDef
}

module.exports = Swagger
