var Endpoint = require('../endpoint'),
    Importer = require('./importer')

function StopLight() {
  this.metadata = null
}
StopLight.prototype = new Importer()

StopLight.prototype.map = function () {
  //all formats are going throught stoplight endpoint, no need to map itself
  return
}

module.exports = StopLight
