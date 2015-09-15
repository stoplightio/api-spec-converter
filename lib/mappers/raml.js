var parser = require('raml-parser'),
    Endpoint = require('../endpoint'),
    Group = require('../group'),
    Mapper = require('./mapper')


function RAML() {

}
RAML.prototype = new Mapper()

function mapBody(methodBody) {
  var data = {mimeType: '', body: {}, example: ''}

  for (var mimeType in methodBody) {
    data.mimeType = mimeType

    if (!methodBody[mimeType]) {
      continue
    }

    if (methodBody[mimeType].example) {
      data.example = methodBody[mimeType].example
    }

    if (!methodBody[mimeType].schema) {
      continue
    }

    var definition = JSON.parse(methodBody[mimeType].schema)
    delete definition['$schema']

    if (definition['type'] && definition['type'] === 'object') {
      data.body['properties'] = {}
    }
    var requiredFileds = []
    for (var key in definition) {
      if (typeof definition[key] === 'object') {
        for (var property in definition[key]) {
          data.body.properties[property] = definition[key][property]
          if (definition[key][property].required) {
            requiredFileds.push(property)
          }
          delete definition[key][property].required
        }
      }
      else {
        if (key !== 'required') {
          data.body[key] = definition[key]
        }
        else if (definition[key] === true) {
          requiredFileds.push(key)
        }
      }
    }
    data.body.required = requiredFileds
  }

  return data
}

function mapQueryStringOrHeader(queryParameters) {
  var queryString = {type:'object', properties: {}, required: []}
  for (var key in queryParameters) {
    queryString.properties[key] = queryParameters[key]
    if (queryParameters[key].required) {
      queryString.required.push(key)
    }
    delete queryParameters[key].required
  }
  return queryString
}

function mapURIParams(uriParams) {
  var pathParams = uriParams
  for (var key in pathParams) {
    pathParams[key].description = pathParams[key].displayName
    delete pathParams[key].displayName
    delete pathParams[key].type
    delete pathParams[key].required
  }
  return pathParams
}

function mapResponse(response) {
  var data = []
  for(var code in response) {
    if (!response[code].body) {
      continue
    }
    var result = mapBody(response[code].body)
    result.codes = [code]
    result.body = JSON.stringify(result.body)
    data.push(result)
  }
  return data
}

RAML.prototype.createEndpoint = function(me, resource, baseURI) {

  var pathParams = {}
  if(resource.uriParameters) {
    pathParams = mapURIParams(resource.uriParameters)
  }

  for (var i = 0; i < resource.methods.length; i++) {
    var method = resource.methods[i]
    var endpoint = new Endpoint(method.description)
    endpoint.Method = method.method
    endpoint.Path = baseURI + resource.relativeUri

    //TODO example/responses/protocol

    if (method.body) {
      endpoint.Body = mapBody(method.body)
    }

    if (method.queryParameters) {
      endpoint.QueryString = mapQueryStringOrHeader(method.queryParameters)
    }

    if (method.headers) {
      endpoint.Headers = mapQueryStringOrHeader(method.headers)
    }

    if (method.responses) {
      endpoint.Responses = mapResponse(method.responses)
    }

    endpoint.PathParams = pathParams

    endpoint.ItemId = me.endpoints.length
    me.endpoints.push(endpoint)
  }

  if(resource.resources && resource.resources.length > 0) {
    for (var i = 0; i < resource.resources.length; i++) {
      me.createEndpoint(me, resource.resources[i], baseURI + resource.relativeUri)
    }
  }
}

RAML.prototype.loadFile = function (filePath) {
  var me = this
  return function(cb) {
    parser.loadFile(filePath).then(function(data) {
      me.data = data
      cb()
    }, function(error) {
      console.log('Error parsing: ' + error)
      cb()
    })
  }
}

RAML.prototype.map = function() {
  for (var i = 0; i < this.data.resources.length; i++) {
    this.createEndpoint(this, this.data.resources[i], '')
  }
}

module.exports = RAML
