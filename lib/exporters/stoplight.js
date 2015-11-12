var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter');

function StopLight() {

}
StopLight.prototype = new Exporter();

StopLight.prototype._export = function () {
  //all formats are going throught stoplight endpoint, no need to map itself
  this.data = {
    project: this.project.toJSON()
  };
};

module.exports = StopLight;
