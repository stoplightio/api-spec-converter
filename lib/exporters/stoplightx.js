var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter'),
    SwaggerExporter = require('./swagger');

function StopLightX() {

}
StopLight.prototype = new Exporter();

StopLight.prototype._export = function () {

  //map as swagger extension

  var swaggerExporter = new SwaggerExporter();
  swaggerExporter.loadProject(this.project);

  this.data = swaggerExporter.export();

  var env = this.project.Environment;

  this.data['x-project'] = {
    before: env.MiddlewareBefore,
    after: env.MiddlewareAfter,
    proxy: env.Proxy,
    functions: this.project.UtilityFunctions.map(function(item){
      return item.toJSON();
    }),
    resourcesOrder: this.project.EndpointsOrder
  };

  for(var i in this.project.Endpoints){
    var endpoint = this.project.Endpoints[i];
    this.data.paths[endpoint.Path][endpoint.Method]['x-stoplight-before'] = endpoint.Before;
    this.data.paths[endpoint.Path][endpoint.Method]['x-stoplight-after'] = endpoint.After;
    this.data.paths[endpoint.Path][endpoint.Method]['x-stoplight-mock'] = endpoint.Mock;
  }
};

module.exports = StopLight;
