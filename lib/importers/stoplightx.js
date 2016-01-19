var Swagger = require('./swagger'),
    Importer = require('./importer'),
    UtilityFunction = require('../entities/utilityFunction'),
    fs = require('fs');

function StopLightX() {
  this.metadata = null;
  this.swaggerImporter = new Swagger();
}
StopLightX.prototype = new Importer();

StopLightX.prototype.loadFile = function(path, cb){
  this.data = 'Dummy data';
  return this.swaggerImporter.loadFile(path, cb);
};

StopLightX.prototype._import = function () {
  this.project = this.swaggerImporter.import();

  var data = this.swaggerImporter.data;

  if (data.hasOwnProperty('x-stoplight')) {
    var environment = this.project.Environment;
    environment.MiddlewareBefore = data['x-stoplight'].before;
    environment.MiddlewareAfter  = data['x-stoplight'].after;
    environment.Proxy  = data['x-stoplight'].proxy;
    this.project.EndpointsOrder = data['x-stoplight'].resourcesOrder;

    for (var i in data['x-stoplight'].functions) {
      var ufData = data['x-stoplight'].functions[i];
      var uf = new UtilityFunction(ufData.name);
      uf.Description = ufData.description;
      uf.Script = ufData.script;
      this.project.addUtilityFunction(uf);
    }

    for(var i in this.project.Endpoints) {
      var endpoint = this.project.Endpoints[i];
      var method = data.paths[endpoint.Path][endpoint.Method];
      endpoint.Before = method['x-stoplight-before'];
      endpoint.After = method['x-stoplight-after'];
      endpoint.Mock = method['x-stoplight-mock'];
      console.log(method['x-stoplight-mock']);
    }
  }

};

module.exports = StopLightX;
