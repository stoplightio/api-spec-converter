var parser = require('swagger-parser')
    Endpoint = require('../endpoint'),
    Group = require('../group'),
    Importer = require('./importer')

function Swagger() {
  this.metadata = null
  this.$refs = null
  this.filePath = null
}

Swagger.prototype = new Importer()

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
    if (param.type === 'array') {
      queryString.properties[param.name].items = param.items
    }
  }
  return queryString
}

function mapURIParams(params) {
  var pathParams = {}
  for (var i in params) {
    var param = params[i]
    if (param.hasOwnProperty('$ref')) {
      //any unresolved data?!?
    }
    if (param.in !== 'path') {
      //skip other type of params
      continue
    }
    pathParams[param.name] = {
      type: param.type,
      description: param.description
    }

    if (param.type === 'array') {
      pathParams[param.name].items = param.items
    }
  }

  return pathParams
}

function mapRequestBody(params, reqType) {
  var data = {mimeType: reqType, body: {properties: {}, required: []}, example: ''}

  for (var i in params) {
    var param = params[i]
    if (param.in !== 'body' && param.in !== 'formData') {
      //skip other type of params
      continue
    }
    if (param.schema) {
      data.body.properties[param.name] = {
        schema: param.schema
      }
    }
    else {
      data.body.properties[param.name] = {
        type: param.type,
        description: param.description,
      }
    }
    if (param.required) {
      data.body.required.push(param.name)
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
    if (responseBody[code].hasOwnProperty('examples')) {
      for(var type in responseBody[code].examples) {
        if (type === resType) {
          res.example = JSON.stringify(responseBody[code].examples[type])
        }
      }
    }
    if (code === 'default') {
      //swagger default usually meant for error responses:
      //https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#responses-object
      code = 400
    }
    res.body = JSON.stringify(res.body)
    res.codes.push(code)
    data.push(res)
  }

  return data
}

function mapRequestHeaders(params) {
  var data = {type: 'object', properties: {}, required: []}

  for (var i in params) {
    var param = params[i]
    if (param.in !== 'header') {
      //skip other type of params
      continue
    }
    data.properties[param.name] = {
      type: param.type
    }
    if (param.required) {
      data.required.push(param.name)
    }
  }
  return data
}

Swagger.prototype.loadFile = function (path) {
  var me = this
  this.filePath = path
  return function(cb) {

     parser.dereference(path)
      .then(function(api, metadata) {
        me.data = api
        me.metadata = metadata
        parser.resolve(path)
          .then(function($refs) {
            me.$refs = $refs.values()[me.filePath]
            cb()
          })
          .catch(function(err) {
            cb(err)
          })
      })
      .catch(function(err) {
        cb(err)
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
      endpoint.Headers = mapRequestHeaders(methods[method].parameters)

      this.endpoints.push(endpoint)
    }
  }
}

Swagger.prototype.mapFrom = function() {
  //TODO
}


module.exports = Swagger
