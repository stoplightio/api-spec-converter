var Endpoint = require('../entities/endpoint'),
    Exporter = require('./exporter'),
    SwaggerExporter = require('./swagger');

function StopLightX() {

}
StopLightX.prototype = new Exporter();



StopLightX.prototype._export = function () {
  //map as swagger extension
  try {
    var swaggerExporter = new SwaggerExporter();
    swaggerExporter.loadProject(this.project);

    this.data = swaggerExporter.export();

    var env = this.project.Environment;
    var prefix = 'x-stoplight';

    for(var i in this.project.Endpoints){
      var endpoint = this.project.Endpoints[i];
      var xStoplight = {
        id: endpoint.Id,
        beforeScript: endpoint.Before || null,
        afterScript: endpoint.After || null,
        public: endpoint.Public,
        mock: endpoint.Mock
      };
      this.data.paths[endpoint.Path][endpoint.Method][prefix] = xStoplight;
    }

    for(var i in this.project.Schemas){
      var schema = this.project.Schemas[i];
      this.data.definitions[schema.namespace][prefix] = {
        id: schema.Id,
        name: schema.Name,
        summary: schema.Summary,
        description: schema.Description,
        public: schema.Public
      };
    }

    var functions = {};
    this.project.UtilityFunctions.map(function(item){
      functions[item.Id] = item.toJSON();
    });
    this.data[prefix] = {
      version: env.toJSON(),
      functions: functions,
      textSections: {} //TODO
    };
  } catch(err) {
    console.log(err);
  }
};

module.exports = StopLightX;
