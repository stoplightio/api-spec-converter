var Endpoint = require('../endpoint'),
    Exporter = require('./exporter')

function Swagger() {
  this.metadata = null
}
Swagger.prototype = new Exporter()

Swagger.prototype.map = function () {
  //TODO
}

module.exports = Swagger
