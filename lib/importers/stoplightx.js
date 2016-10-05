var Swagger = require('./swagger');
var Importer = require('./importer');
var UtilityFunction = require('../entities/utilityFunction');
var Text = require('../entities/text');
var Test = require('../entities/test');
var _ = require('lodash');

var prefix = 'x-stoplight';
var testsPrefix = 'x-tests';

function StopLightX() {
  this.metadata = null;
  this.importer = new Swagger();
}
StopLightX.prototype = new Importer();

StopLightX.prototype.loadFile = function(path, cb) {
  var me = this;
  return this.importer.loadFile(path, function(err) {
    me.data = me.importer.data;
    cb(err);
  });
};

StopLightX.prototype.loadData = function(path) {
  var me = this;
  return new Promise(function(resolve, reject) {
    me.importer.loadData(path)
    .then(function() {
      me.data = me.importer.data;
      resolve();
    })
    .catch(function(err) {
      reject(err);
    });
  });
};

function map(step) {
	var parts;
	var stepId;
	if (step.$ref) {
		parts = step.$ref.split('/');
		stepId = _.last(parts);
		return {
			test: stepId,
		};
	}
	return step;
}

StopLightX.prototype._import = function() {
	var data;
	var environment;
	var stoplightData;
	var functionsKey;
	var ufData;
	var uf;
	var textSectionsKey;
	var txtData;
	var txt;
	var endpointsKey;
	var endpoint;
	var method;
	var schemaKey;
	var schema;
	var schemaData;
	var id;
	var testData;
	var test;
  this.project = this.importer.import();

  data = this.importer.data;
  if (!{}.hasOwnProperty.call(data, prefix)) {
    return;
  }
  environment = this.project.Environment;

 	stoplightData = data[prefix];

  if ({}.hasOwnProperty.call(stoplightData, 'version')) {
    environment.loadSLData(data[prefix].version);
    // property names are different from db name
    environment.GroupsOrder = data[prefix].version.groups;
    environment.MiddlewareBefore = data[prefix].beforeScript;
    environment.MiddlewareAfter = data[prefix].afterScript;

    this.project.Environment = environment;
  }

  for (functionsKey in data[prefix].functions) {
    ufData = data[prefix].functions[functionsKey];
    uf = new UtilityFunction(ufData.name);
    uf.Description = ufData.description;
    uf.Script = ufData.script;
    this.project.addUtilityFunction(uf);
  }

  for (textSectionsKey in data[prefix].textSections) {
    txtData = data[prefix].textSections[textSectionsKey];
    txt = new Text(txtData.name);
    txt.Id = txtData.id;
    txt.Content = txtData.content;
    txt.Public = txtData.public;
    this.project.addText(txt);
  }

  for (endpointsKey in this.project.Endpoints) {
    endpoint = this.project.Endpoints[endpointsKey];
    method = data.paths[endpoint.Path][endpoint.Method][prefix];

    if (method) {
      endpoint.Before = method.beforeScript;
      endpoint.After = method.afterScript;
      endpoint.Mock = method.mock;
      endpoint.Id = method.id;
    }
  }

  for (schemaKey in this.project.Schemas) {
    schema = this.project.Schemas[schemaKey];
    schemaData = data.definitions[schema.NameSpace][prefix];
    if (schemaData) {
      schema.Id = schemaData.id;
      schema.Name = schemaData.name;

      if (!_.isEmpty(schemaData.summary)) {
        schema.Summary = schemaData.summary;
      }

      schema.Description = schemaData.description;
      schema.Public = schemaData.public;
    }
  }

  if ({}.hasOwnProperty.call(data, testsPrefix)) {
    for (id in data[testsPrefix]) {
      testData = data[testsPrefix][id];
      test = new Test(testData.name);
      test.Id = testData.id;

      if (!_.isEmpty(testData.summary)) {
        test.Summary = testData.summary;
      }

      test.InitialVariables = testData.initialVariables;
      test.Steps = testData.steps.map(map);
			this.project.addTest(test);
    }
  }
};

module.exports = StopLightX;
