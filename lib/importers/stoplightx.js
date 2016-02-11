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

  try {
    this.project = this.swaggerImporter.import();

    var data = this.swaggerImporter.data;
    var prefix = 'x-stoplight';
    if (data.hasOwnProperty(prefix)) {
      var environment = this.project.Environment;
      environment.loadSLData(data[prefix].version);
      this.project.Environment = environment;

      for (var name in data[prefix].functions) {
        var ufData = data[prefix].functions[name];
        var uf = new UtilityFunction(ufData.name);
        uf.Id = ufData.id;
        uf.Description = ufData.description;
        uf.Script = ufData.script;
        this.project.addUtilityFunction(uf);
      }

      for(var i in this.project.Endpoints) {
        var endpoint = this.project.Endpoints[i];
        var method = data.paths[endpoint.Path][endpoint.Method][prefix];
        endpoint.Before = method['beforeScript'];
        endpoint.After = method['afterScript'];
        endpoint.Mock = method['mock'];
        endpoint.Id = method['id'];
      }

      for(var i in this.project.Schemas) {
        var schema = this.project.Schemas[i];
        var schemaData = data.definitions[schema.Name][prefix];
        schema.Id = schema.Id;
        schema.Name = schema.Name;
        schema.Summary = schema.Summary;
        schema.Description = schema.Description;
        schema.Public = schema.Public;
      }
    }
  } catch(err) {
    console.log(err);
  }
};

module.exports = StopLightX;
