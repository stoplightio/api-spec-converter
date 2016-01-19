var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter'),
    SwaggerExporter = require('./swagger');

function StopLight() {

}
StopLight.prototype = new Exporter();

StopLight.prototype._export = function () {

  this.data = {
    project: this.project.toJSON()
  };

};

module.exports = StopLight;
