var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter'),
    SwaggerExporter = require('./swagger');

function StopLightX() {

}
StopLightX.prototype = new Exporter();

StopLightX.prototype._export = function () {

  //map as swagger extension

  var swaggerExporter = new SwaggerExporter();
  swaggerExporter.loadProject(this.project);

  this.data = swaggerExporter.export();

  var env = this.project.Environment;
  var prefix = 'x-stoplight';

  for(var i in this.project.Endpoints){
    var endpoint = this.project.Endpoints[i];
    this.data.paths[endpoint.Path][endpoint.Method][prefix + '-before'] = endpoint.Before;
    this.data.paths[endpoint.Path][endpoint.Method][prefix + '-after'] = endpoint.After;
    this.data.paths[endpoint.Path][endpoint.Method][prefix + '-mock'] = endpoint.Mock;

    this.data.paths[endpoint.Path][endpoint.Method][prefix +'-id'] = endpoint.Id;
  }

  for(var i in this.project.Schemas){
    var schema = this.project.Schemas[i];
    this.data.definitions[schema.namespace][prefix + '-id'] = schema.Id;
  }

  this.data[prefix] = {
    environment: env.toJSON(),
    functions: this.project.UtilityFunctions.map(function(item){
      var result = item.toJSON();
      result[prefix + '-id'] = item.Id;
      return result;
    }),
    groups: this.project.GroupsOrder
  };
};

module.exports = StopLightX;
