var Endpoint = require('../endpoint'),
    Mapper = require('./mapper')

function StopLight() {
  this.metadata = null
}
StopLight.prototype = new Mapper()

StopLight.prototype.map = function () {
  //all formats are going throught stoplight endpoint, no need to map itself
  return
}

StopLight.prototype.mapFrom = function () {
  this.data = {
    endpoints: this.endpoints,
    groups: this.groups
  }
}

module.exports = StopLight
