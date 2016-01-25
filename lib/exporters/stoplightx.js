var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter'),
    SwaggerExporter = require('./swagger');

function StopLightX() {

}
StopLightX.prototype = new Exporter();

StopLightX.prototype.replaceIdInOrders = function(orginId, newId, orderData) {
  if (!orginId) {
    return orderData;
  }
  for (var orderIndex in orderData) {
    var itemIndex = orderData[orderIndex].items.indexOf(orginId);
    if (itemIndex >= 0) {
      orderData[orderIndex].items[itemIndex] = newId;
    }
  }
  return orderData;
};

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

    //replace identifier
    var originId = endpoint.Id;
    var newId = endpoint.Method + '_' + endpoint.Path.replace(/\//g, '-');
    this.data.paths[endpoint.Path][endpoint.Method][prefix +'-id'] = newId;
    this.project.GroupsOrder.endpoints = this.replaceIdInOrders(originId, newId, this.project.GroupsOrder.endpoints);
  }

  for(var i in this.project.Schemas){
    var schema = this.project.Schemas[i];
    this.data.definitions[schema.namespace][prefix + '-id'] = schema.namespace;
    this.project.GroupsOrder.schemas = this.replaceIdInOrders(schema.Id, schema.namespace, this.project.GroupsOrder.schemas);
  }

  for(var i in this.project.UtilityFunctions){
    var uf = this.project.UtilityFunctions[i];
    this.project.GroupsOrder.utilFuncs = this.replaceIdInOrders(uf.Id, uf.name, this.project.GroupsOrder.utilFuncs);
  }

  this.data[prefix] = {
    before: env.MiddlewareBefore,
    after: env.MiddlewareAfter,
    proxy: env.Proxy,
    functions: this.project.UtilityFunctions.map(function(item){
      var result = item.toJSON();
      result[prefix + '-id'] = item.name;
      return result;
    }),
    groups: this.project.GroupsOrder
  };
};

module.exports = StopLightX;
