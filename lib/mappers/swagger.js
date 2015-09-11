var Endpoint = require('../endpoint')
var Group = require('../group')
var parser = require('swagger-parser')

function Swagger() {
  this.data = null
  this.metadata = null
  this.endpoints = []

  this.groups = []
}


function mapQueryString(params) {
  var queryString = {type:'object', properties: {}, required: []}
  for (var i in params) {
    var param = params[i]
    if (param.in !== 'query') {
      //skip other type of params
      continue
    }
    queryString.properties[param.name] = {
      type: param.type,
      description: param.description
    }
    if (param.required) {
      queryString.required.push(param.name)
    }
  }
  return queryString
}

function mapURIParams(params) {
  var pathParams = {}
  for (var i in params) {
    var param = params[i]
    if (param.in !== 'path') {
      //skip other type of params
      continue
    }
    pathParams[param.name] = {
      type: param.type,
      description: param.description
    }
  }

  return pathParams
}

function mapRequestBody(params, reqType) {
  var data = {mimeType: reqType, body: {properties: {}}, example: ''}

  for (var i in params) {
    var param = params[i]
    if (param.in !== 'body') {
      //skip other type of params
      continue
    }
    if (param.schema) {
      data.body = param.schema
    }
  }
  data.body = JSON.stringify(data.body)
  return data
}

function mapResponseBody(responseBody, resType) {
  var data = []
  for (var code in responseBody) {
    var res = {mimeType: resType, body: {}, example: '', codes: []}
    if (responseBody[code].schema) {
      res.body = responseBody[code].schema
    }

    if (code === 'default') {
      //as no 'default' concept in stoplight, use 200 as default
      code = 200
    }
    res.body = JSON.stringify(res.body)
    res.codes.push(code)
    data.push(res)
  }

  return data
}

Swagger.prototype.loadFile = function (path) {
  var me = this
  return function(cb) {
    parser.parse(path, function(err, api, metadata) {
      if (err) {
        return console.log('error: ', err)
      }
      me.data = api
      me.metadata = metadata
      cb()
    })
  }
}

Swagger.prototype.map = function() {
  var defaultReqContentType = this.data.consumes, defaultResContentType = this.data.produces

  for (var path in this.data.paths) {
    var methods = this.data.paths[path]
    var pathParams = {}
    if (methods.parameters) {
      pathParams = mapURIParams(methods.parameters)
    }

    for (var method in methods) {
      if (method === 'parameters') {
        continue
      }
      var endpoint = new Endpoint(methods[method].description),
        reqType = defaultResContentType,
        resType = defaultResContentType

      endpoint.Path = path
      endpoint.Method = method


      //map request body
      if (methods[method].consumes) {
        //taking only one
        reqType = methods[method].consumes[0]
      }
      endpoint.Body = mapRequestBody(methods[method].parameters, reqType)

      //map response body
      if (methods[method].produces) {
        //taking only one
        resType = methods[method].produces[0]
      }
      endpoint.Responses = mapResponseBody(methods[method].responses, resType)

      //map query string
      endpoint.QueryString = mapQueryString(methods[method].parameters)

      //map path params
      endpoint.PathParams = pathParams

      //map headers

      this.endpoints.push(endpoint)
    }
  }
}

Swagger.prototype.getRawData = function() {
  return this.data
}

Swagger.prototype.getEndpoints = function() {
  return this.endpoints
}

Swagger.prototype.getEndpointGroups = function() {
  return this.groups
}

module.exports = Swagger
