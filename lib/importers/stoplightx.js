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
  var me = this;
  return this.swaggerImporter.loadFile(path, function(){
    me.data = me.swaggerImporter.data;
    cb();
  });
};

StopLightX.prototype.loadData = function(path, cb){
  var me = this;
  return this.swaggerImporter.loadData(path, function(err){
    if (err) {
      return cb(err);
    }
    me.data = me.swaggerImporter.data;
    cb();
  });
};

StopLightX.prototype._import = function () {
  this.project = this.swaggerImporter.import();

  var data = this.swaggerImporter.data;
  var prefix = 'x-stoplight';
  if (data.hasOwnProperty(prefix)) {
    var environment = this.project.Environment;
    environment.loadSLData(data[prefix].environment);
    this.project.Environment = environment;

    for (var i in data[prefix].functions) {
      var ufData = data[prefix].functions[i];
      var uf = new UtilityFunction(ufData.name);
      uf.Id = ufData[prefix + '-id'];
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

    for(var i in this.project.Schemas) {
      var schema = this.project.Schemas[i];
      var schemaId = data.definitions[schema.Name][prefix + '-id'];
      schema.Id = schemaId;
    }
  }

};

module.exports = StopLightX;
