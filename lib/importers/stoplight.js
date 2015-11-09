var Endpoint = require('../entities/endpoint'),
    Group = require('../entities/group'),
    Schema = require('../entities/schema'),
    Importer = require('./importer'),
    fs = require('fs')

function StopLight() {
  this.metadata = null
}
StopLight.prototype = new Importer()

StopLight.prototype.loadFile = function(path, cb){
  this.data = JSON.parse(fs.readFileSync(path, 'utf8'))
  cb()
}

StopLight.prototype._import = function () {
  var projectName, projectDesc
  if (this.data.project) {
    projectName = this.data.project.name
    projectDesc = this.data.project.description
  }
  else {
    projectName = ''
    projectDesc = ''
  }

  this.project = new Project(projectName)
  this.project.Description = projectDesc
  this.project.Environment.loadSLData(this.data.project.environment)

  //all formats are going throught stoplight endpoint, no need to map itself
  for(var i in this.data.endpoints) {
    var endpointData = this.data.endpoints[i]
    var endpoint = new Endpoint('')
    endpoint.SLData = endpointData
    this.project.addEndpoint(endpoint)
  }

  for (var i in this.data.schemas) {
    var schemaData = this.data.schemas[i]
    var schema = new Schema(schemaData.name)
    schema.Definition = JSON.parse(schemaData.definition)
    this.project.addSchema(schema)
  }
  //TODO mapp to group entity
  this.project.Groups = this.data.groups
}

module.exports = StopLight
