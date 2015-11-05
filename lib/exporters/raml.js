var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter')

function RAMLDefinition(title) {
  this.title = title
  this.version = "v1"
  this.baseUri = ""
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

RAML.prototype.map = function () {
  ramlDef = new RAMLDefinition(this.project.Name)
  ramlDef.baseUri = this.project.Environment.Host + "/" + this.project.Environment.BasePath

  var endpoints = this.project.Endpoints
  for(var i in endpoints) {

    var endpoint = endpoints[i], parameters = []

    var method = {
      displayName: endpoint.Name,
      method: endpoint.Method,
      description: endpoint.Description
    }

    //TODO map method body
    //TODO map method header
    //TODO map method response
    //TODO map method path params
    //TODO map method query params

    var index = ramlDef.findResourceIndexByURI(endpoint.Path)
    if(index < 0) {
      //Not found, create new resource
      var resource = {
        displayName: endpoint.Name, //TODO we don't have name in group wise
        relativeUri: endpoint.Path,
        methods: [method]
      }
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
