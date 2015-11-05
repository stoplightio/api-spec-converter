var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter')

function RAMLDefinition(title) {
  this.title = title
  //TODO anyway to know version?
  this.version = "v1"
  this.baseUri = ""
  //TODO how to know globabl media Type from stoplight?
  this.mediaType = ""
  this.resources = []
}

RAMLDefinition.prototype.findResourceIndexByURI = function(uri) {
  for(var i=0; i< this.resources.length; i++) {
    if(this.resources[i].relativeUri == uri) {
      return i
    }
  }
  return -1
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
    pathParams[key] = {
      displayName: pathParamData[key].description
    }
  }
  return pathParams
}


RAML.prototype.map = function () {
  ramlDef = new RAMLDefinition(this.project.Name)
  ramlDef.baseUri = this.project.Environment.Host + this.project.Environment.BasePath

  var endpoints = this.project.Endpoints
  for(var i in endpoints) {

    var endpoint = endpoints[i], parameters = []

    var method = {
      displayName: endpoint.Name,
      method: endpoint.Method,
      description: endpoint.Description
    }
    method.body = mapBody(endpoint.Body)

    //TODO map method header
    method.headers = mapHeaders(endpoint.Headers)

    method.responses = mapResponses(endpoint.Responses)

    method.queryParameters = mapQueryParams(endpoint.QueryString)

    var index = ramlDef.findResourceIndexByURI(endpoint.Path)
    if(index < 0) {
      //Not found, create new resource
      var resource = {
        displayName: endpoint.Name, //TODO we don't have name in group wise
        relativeUri: endpoint.Path,
        methods: [method]
      }
      resource.uriParameters = mapQueryParams(endpoint.PathParams)
      ramlDef.resources.push(resource)
    }
    else {
      //add to existing resource
      ramlDef.resources[index].methods.push(method)
    }
  }

  this.data = ramlDef
}

module.exports = RAML
