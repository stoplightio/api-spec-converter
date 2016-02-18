var Swagger = require('./swagger'),
    Importer = require('./importer'),
    UtilityFunction = require('../entities/utilityFunction'),
    Text = require('../entities/text'),
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

StopLightX.prototype.loadData = function(path){
  var me = this;
  return new Promise(function(resolve, reject){
    me.swaggerImporter.loadData(path)
    .then(function(){
      me.data = me.swaggerImporter.data;
      resolve();
    })
    .catch(function(err){
      reject(err);
    });
  });
};

StopLightX.prototype._import = function () {

    this.project = this.swaggerImporter.import();

    var data = this.swaggerImporter.data;
    var prefix = 'x-stoplight';
    if (!data.hasOwnProperty(prefix)) {
      return;
    }
    var environment = this.project.Environment;

    var stoplightData = data[prefix];

    if (stoplightData.hasOwnProperty('version')) {
      environment.loadSLData(data[prefix].version);
      //property names are different from db name
      environment.GroupsOrder = data[prefix].version.groups;
      environment.MiddlewareBefore = data[prefix].version.beforeScript;
      environment.MiddlewareAfter = data[prefix].version.afterScript;

      this.project.Environment = environment;
    }

    for (var name in data[prefix].functions) {
      var ufData = data[prefix].functions[name];
      var uf = new UtilityFunction(ufData.name);
      uf.Description = ufData.description;
      uf.Script = ufData.script;
      this.project.addUtilityFunction(uf);
    }

    for (var name in data[prefix].textSections) {
      var txtData = data[prefix].textSections[name];
      var txt = new Text(txtData.name);
      txt.Id = txtData.id;
      txt.Content = txtData.content;
      txt.Public = txtData.public;
      this.project.addText(txt);
    }

    for(var i in this.project.Endpoints) {
      var endpoint = this.project.Endpoints[i];
      var method = data.paths[endpoint.Path][endpoint.Method][prefix];
      if (method) {
        endpoint.Before = method['beforeScript'];
        endpoint.After = method['afterScript'];
        endpoint.Mock = method['mock'];
        endpoint.Id = method['id'];
      }
    }

    for(var i in this.project.Schemas) {
      var schema = this.project.Schemas[i];
      var schemaData = data.definitions[schema.NameSpace][prefix];
      if (schemaData) {
        schema.Id = schemaData.id;
        schema.Name = schemaData.name;
        schema.Summary = schemaData.summary;
        schema.Description = schemaData.description;
        schema.Public = schemaData.public;
      }
    }
};

module.exports = StopLightX;
