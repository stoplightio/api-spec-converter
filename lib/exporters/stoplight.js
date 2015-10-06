var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter')

function StopLight() {

}
StopLight.prototype = new Exporter()

StopLight.prototype.map = function () {
  //all formats are going throught stoplight endpoint, no need to map itself
  this.data = {
    endpoints: this.project.Endpoints,
    groups: this.project.Groups,
    schemas: this.project.Schemas,
    environment: this.project.Environment,
  }
  return
}

module.exports = StopLight
