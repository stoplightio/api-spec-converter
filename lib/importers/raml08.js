var RAML = require('./baseraml');
var Schema = require('../entities/schema');
var jsonHelper = require('../utils/json');
var Text = require('../entities/text');

function RAML08() {}
RAML08.prototype = new RAML();

RAML08.prototype.mapRequestBody = function(methodBody) {
	var data = {mimeType: '', body: {}, example: ''};
	// TODO: only one, the latest is in effect in stoplight!
	for (var i in methodBody) {
		if (!methodBody.hasOwnProperty(i)) continue;
		var mimeType = methodBody[i];
		data.mimeType = mimeType.name;
		if (mimeType.example) {
			data.example = mimeType.example;
		}
		if (mimeType.schema) {
			data.body = this.convertRefToModel(jsonHelper.parse(mimeType.schema));
		} else if (mimeType.formParameters) {
			data.body = {
				type: 'object',
				properties: {},
				required: [],
			};
			var formParams = mimeType.formParameters;
			for (var j in formParams) {
				if (!formParams.hasOwnProperty(j)) continue;
				var param = formParams[j];
				data.body.properties[param.name] = {
					type: param.type,
				};
				if (param.description) {
					data.body.properties[param.name].description = param.description;
				}
				if (param.required) {
					data.body.required.push(param.name);
				}
			}
		}
	}
	return data;
};

RAML08.prototype.mapSchema = function(schemData) {
	var schemas = [];
	for (var i in schemData) {
		if (!schemData.hasOwnProperty(i)) continue;
		for (var schemaName in schemData[i]) {
			if (!schemData[i].hasOwnProperty(schemaName)) continue;
			var sd = new Schema(schemaName);
			sd.Name = schemaName;
			sd.Definition = jsonHelper.cleanSchema(schemData[i][schemaName]);
			schemas.push(sd);
		}
	}
	return schemas;
};

RAML08.prototype.getSchema = function(data) {
    return data.schemas;
};

RAML08.prototype.description = function(project, data) {
	var documentation = data.documentation;
	if (documentation && documentation.length > 0) {
		project.Description = documentation[0].content;
		project.Environment.summary = documentation[0].content;
	}

	// text sections
	if (documentation) {
		for (var i in documentation) {
			if (!documentation.hasOwnProperty(i)) continue;
			var doc = documentation[i];
			var txt = new Text(doc.title);
			txt.Public = true;
			txt.Content = doc.content;
			this.project.addText(txt);
		}
	}
};

module.exports = RAML08;
