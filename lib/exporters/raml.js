var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter'),
    YAML = require('json2yaml')

//TODO right now, no hiearachy support yet
//SL doesn't contain those info anyway

function RAMLDefinition(title, env) {
  this.title = title
  //TODO anyway to know version?
  this.version = "v1"
  this.baseUri = env.Host + env.BasePath
  this.mediaType = env.DefaultResponseType || ""
  this.protocols = mapProtocols(env.Protocols)

  //TODO any way to get the SL documentation
  //this.documentation = []
}

RAMLDefinition.prototype.addMethod = function(resource, methodURIs, methodKey, method) {
  if (methodURIs.length <= 0) {
    //reach the leaf of tree
    //TODO optional: check same method existence
    resource[methodKey] = method
  }
  else {
    var currentURI = "/" + methodURIs[0]
    if (!resource[currentURI]) {
      resource[currentURI] = {
        "displayName": methodURIs[0],
        "description": ""
      }
      //TODO uriParams?!?
    }
    methodURIs.splice(0, 1)
    this.addMethod(resource[currentURI], methodURIs, methodKey, method)
  }
}


function RAML() {
  this.metadata = null
}

RAML.prototype = new Exporter()

function mapBody(bodyData){
  var body = {}
  if (bodyData.body) {
    //TODO default as applicaiton/json, is it OK?
    var mimeType = bodyData.mimeType || 'application/json'
    body[mimeType] = {
      example: bodyData.example || '',
      schema: bodyData.body
    }
  }
  return body
}

function mapHeaders(headerData){
  var headers = {}
  headers = headerData.properties
  return headers
}

function mapResponses(responseData){
  var responses = {}
  for(var i=0; i< responseData.length; i++) {
    resBody = responseData[i]
    if(resBody.codes.length>0) {
      var code = resBody.codes[0]
      responses[code] = {
        body: {}
      }

      var type = resBody.mimeType || 'application/json'
      responses[code]['body'][type] = {
        'schema': resBody.body,
        'example': resBody.example
      }
    }
  }
  return responses
}

function mapQueryParams(queryParams) {
  var queryString = {}
  for(var key in queryParams.properties) {
    queryString[key] = queryParams.properties[key]
    if(queryParams.required.indexOf(key) > -1){
      queryString[key].required = true
    }
  }
  return queryString
}

function mapPathParams(pathParamData) {
  var pathParams = {}
  for(var key in pathParamData) {
    pathParams[key] = {}
    if(pathParamData[key].description) {
      pathParams[key].description = pathParamData[key].description
    }
    if(pathParamData[key].type) {
      pathParams[key].type = pathParamData[key].type
    }
  }
  return pathParams
}

function mapProtocols(protocols) {
  var validProtocols = []
  for(var i=0; i<protocols.length; i++) {
    if ((protocols[i].toLowerCase() != 'http') && (protocols[i].toLowerCase() != 'https')) {
      //RAML incompatible formats( 'ws' etc)
      continue
    }
    validProtocols.push(protocols[i])
  }
  return validProtocols
}


RAML.prototype.map = function () {
  var env = this.project.Environment
  var ramlDef = new RAMLDefinition(this.project.Name, env)

  var endpoints = this.project.Endpoints
  for(var i in endpoints) {

    var endpoint = endpoints[i], parameters = []

    var method = {
      displayName: endpoint.Name,
      description: endpoint.Description
    }

    if (endpoint.Method.toLowerCase() === "post" || endpoint.Method.toLowerCase() === "put") {
      method.body = mapBody(endpoint.Body)
    }

    method.headers = mapHeaders(endpoint.Headers)

    method.responses = mapResponses(endpoint.Responses)

    method.queryParameters = mapQueryParams(endpoint.QueryString)

    var uriParts = endpoint.Path.split("/")
    uriParts.splice(0, 1)
    ramlDef.addMethod(ramlDef, uriParts, endpoint.Method, method)
  }

  this.data = ramlDef
}

RAML.prototype.getData = function(format) {
  switch (format) {
    case 'yaml':
      return "#%RAML 0.8\n"+YAML.stringify(this.data)
    default:
      throw Error('RAML doesn not support '+format+' format')
  }
}

module.exports = RAML
