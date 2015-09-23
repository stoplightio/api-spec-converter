var Endpoint = require('../endpoint'),
    Importer = require('./importer')

function StopLight() {
  this.metadata = null
}
StopLight.prototype = new Importer()

StopLight.prototype.map = function () {
  //all formats are going throught stoplight endpoint, no need to map itself
  for(var i in this.data.endpoints) {
    var endpointData = this.data.endpoints[i]
    var endpoint = new Endpoint('')
    endpoint.SLData = endpointData
    this.endpoints.push(endpoint)
  }
  this.groups = this.data.groups
  return
}

module.exports = StopLight
