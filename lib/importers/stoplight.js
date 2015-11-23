var Endpoint = require('../entities/endpoint'),
    Project = require('../entities/project'),
    Schema = require('../entities/schema'),
    UtilityFunction = require('../entities/utilityFunction'),
    Importer = require('./importer'),
    fs = require('fs');

function StopLight() {
  this.metadata = null;
}
StopLight.prototype = new Importer();

StopLight.prototype.loadFile = function(path, cb){
  try {
    this.data = JSON.parse(fs.readFileSync(path, 'utf8'));
    cb();
  }
  catch(err) {
    cb(err);
  }
};

StopLight.prototype._mapSchema = function () {
  for (var i in this.data.project.schemas) {
    var schemaData = this.data.project.schemas[i];
    var parts = schemaData.namespace.split('/');
    var schema = new Schema(parts[parts.length-1]);
    schema.SLData = schemaData;
    this.project.addSchema(schema);
  }
};

StopLight.prototype.mapEndpoint = function() {
  //all formats are going throught stoplight endpoint, no need to map itself
  for(var i in this.data.project.endpoints) {
    var endpointData = this.data.project.endpoints[i];
    var endpoint = new Endpoint('');
    endpoint.SLData = endpointData;
    this.project.addEndpoint(endpoint);
  }
};

StopLight.prototype.mapUtilityFunctions = function() {
  for (var i in this.data.project.utilityFunctions) {
    var ufData = this.data.project.utilityFunctions[i];
    var uf = new UtilityFunction(ufData.name);
    uf.Description = ufData.description;
    uf.Script = ufData.script;
    this.project.addUtilityFunction(uf);
  }
};

StopLight.prototype.mapSecuritySchemes = function() {
  this.project.SecuritySchemes = this.data.project.securitySchemes;
};

StopLight.prototype._import = function () {
  var projectName, projectDesc;
  if (!this.data.project) {
    throw new Error('Invalid formatted stoplight data');
  }

  this.project = new Project(this.data.project.name);
  this.project.loadSLData(this.data.project);

  this.project.Environment.loadSLData(this.data.project.environment);

  this.mapEndpoint();

  this._mapSchema();

  this.mapUtilityFunctions();

  this.mapSecuritySchemes();

  if(this.data.project.endpointsOrder) {
    this.project.EndpointsOrder = this.data.project.endpointsOrder;
  }
};

module.exports = StopLight;
