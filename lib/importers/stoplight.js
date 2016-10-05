var Endpoint = require('../entities/endpoint');
var Project = require('../entities/project');
var Schema = require('../entities/schema');
var UtilityFunction = require('../entities/utilityFunction');
var Text = require('../entities/text');
var Importer = require('./importer');
var fs = require('fs');

function StopLight() {
  this.metadata = null;
}
StopLight.prototype = new Importer();

StopLight.prototype.loadFile = function(path, cb) {
  try {
    this.data = JSON.parse(fs.readFileSync(path, 'utf8'));
    cb();
  } catch (err) {
    cb(err);
  }
};

StopLight.prototype._mapSchema = function() {
	var i;
	var schemaData;
	var schema;
  for (i in this.data.project.schemas) {
    schemaData = this.data.project.schemas[i];
    schemaData.namespace = schemaData.namespace.replace('#/definitions/', '');
    schema = new Schema(schemaData.namespace);
    schema.SLData = schemaData;
    this.project.addSchema(schema);
  }
};

StopLight.prototype.mapEndpoint = function() {
	var i;
	var endpointData;
	var endpoint;
  // all formats are going throught stoplight endpoint, no need to map itself
  for (i in this.data.project.endpoints) {
    endpointData = this.data.project.endpoints[i];
    endpoint = new Endpoint('');
    endpoint.SLData = endpointData;
    this.project.addEndpoint(endpoint);
  }
};

StopLight.prototype.mapUtilityFunctions = function() {
	var i;
	var ufData;
	var uf;
	for (i in this.data.project.utilityFunctions) {
    ufData = this.data.project.utilityFunctions[i];
    uf = new UtilityFunction(ufData.name);
    uf.Description = ufData.description;
    uf.Script = ufData.script;
    this.project.addUtilityFunction(uf);
  }
};

StopLight.prototype.mapTexts = function() {
	var i;
	var txt;
	var text;
  for (i in this.data.project.texts) {
    txt = this.data.project.texts[i];
    text = new Text(txt.name);
    text.Id = txt._id;
    text.Name = txt.name;
    text.Content = txt.content;
    text.Public = txt.public;
    this.project.addText(text);
  }
};

StopLight.prototype.mapTraits = function() {
  this.project.traits = this.data.project.traits;
};

StopLight.prototype.mapSecuritySchemes = function() {
  this.project.SecuritySchemes = this.data.project.securitySchemes;
};

StopLight.prototype._import = function() {
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

  this.mapTexts();

  this.mapTraits();

  if (this.data.project.resourcesOrder) {
    this.project.GroupsOrder = this.data.project.resourcesOrder;
  }
};

module.exports = StopLight;
