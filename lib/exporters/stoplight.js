var Endpoint = require('../endpoint'),
    Exporter = require('./exporter')

function StopLight() {

}
StopLight.prototype = new Exporter()

StopLight.prototype.map = function () {
  //all formats are going throught stoplight endpoint, no need to map itself
  this.data = {
    endpoints: this.endpoints,
    groups: this.groups
  }
  return
}

module.exports = StopLight
