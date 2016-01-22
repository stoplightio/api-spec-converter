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
  var prefix = 'x-stoplight';
  if (data.hasOwnProperty(prefix)) {
    var environment = this.project.Environment;
    environment.MiddlewareBefore = data[prefix].before;
    environment.MiddlewareAfter  = data[prefix].after;
    environment.Proxy  = data[prefix].proxy;
    this.project.Environment = environment;
    this.project.GroupsOrder = data[prefix].groups;
    for (var i in data[prefix].functions) {
      var ufData = data[prefix].functions[i];
      var uf = new UtilityFunction(ufData.name);
      uf.Description = ufData.description;
      uf.Script = ufData.script;
      this.project.addUtilityFunction(uf);
    }

    for(var i in this.project.Endpoints) {
      var endpoint = this.project.Endpoints[i];
      var method = data.paths[endpoint.Path][endpoint.Method];
      endpoint.Before = method[prefix + '-before'];
      endpoint.After = method[prefix + '-after'];
      endpoint.Mock = method[prefix + '-mock'];
      endpoint.Id = method[prefix + '-id'];
    }
  }

};

module.exports = StopLightX;
