var parser = require('swagger-parser')
    Endpoint = require('../entities/endpoint'),
    Schema = require('../entities/schema'),
    Importer = require('./importer'),
    Project = require('../entities/project')

function Swagger() {
  this.metadata = null
  this.$refs = null
  this.filePath = null
}

Swagger.prototype = new Importer()

function mapSchema(schemaDefinitions) {
  var result = []
  for (var schemaName in schemaDefinitions) {
    var sd = new Schema(schemaName)
    sd.Definition = schemaDefinitions[schemaName]
    result.push(sd)
  }
  return result
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
      //console.log(i, param)
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

    data.body.properties[param.name] = {
      description: param.description || '',
    }
    if (param.schema) {
      data.body.properties[param.name]['schema'] = param.schema
      //data.body.properties[param.name].type = 'object'
    }
    else if (param.type) {
      data.body.properties[param.name]['type'] = param.type
    }
    if (param.required) {
      data.body.required.push(param.name)
    }
  }
  return data
}

function mapResponseBody(responseBody, resType) {
  var data = [], defaultCodeTaken = false
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
    if (code === 400 || code === '400') {
      if (defaultCodeTaken) continue
      defaultCodeTaken = true
    }
    res.description = responseBody[code].description || ''
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
      type: param.type,
      description: param.description || ''
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
     parser.parse(path)
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

  var defaultReqContentType = 'application/json', defaultResContentType = 'application/json'
  if (this.data.consumes && this.data.consumes.length > 0) {
    defaultReqContentType = this.data.consumes[0]
  }
  if (this.data.produces && this.data.produces.length > 0) {
    defaultResContentType = this.data.produces[0]
  }
  this.project = new Project(this.data.info.title)
  this.project.Description = this.data.info.description || ''

  this.project.Environment.BasePath = this.data.basePath || ''
  this.project.Environment.Host = this.data.host || 'localhost'


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
      var endpoint = new Endpoint(methods[method].operationId || ''),
        reqType = defaultReqContentType,
        resType = defaultResContentType

      endpoint.Path = path
      endpoint.Method = method

      endpoint.Description = methods[method].description || methods[method].summary
      endpoint.Summary = methods[method].summary || ''

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

      this.project.addEndpoint(endpoint)
    }
  }

  this.schemas = mapSchema(this.data.definitions)
  for(var i in this.schemas) {
    this.project.addSchema(this.schemas[i])
  }

  //set mapped flag
  this.mapped = true
}

module.exports = Swagger
