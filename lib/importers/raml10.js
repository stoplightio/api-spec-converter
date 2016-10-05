var RAML = require('./baseraml');
var Schema = require('../entities/schema');
var jsonHelper = require('../utils/json');
var _ = require('lodash');

function RAML10() {}
RAML10.prototype = new RAML();

RAML10.prototype.mapRequestBody = function(methodBody) {
	var data = {mimeType: ''};
	// TODO: only one, the latest is in effect in stoplight!
	for (var i in methodBody) {
		if (!methodBody.hasOwnProperty(i)) continue;
		var mimeType = methodBody[i];
		data.mimeType = i;
		if (mimeType.example) {
			data.example = mimeType.example;
		}
		if (mimeType.description) {
			data.description = mimeType.description;
		}
		if (mimeType.properties && !_.isEmpty(mimeType.properties)) {
			switch (data.mimeType) {
				case 'application/json':
					data.body = {properties: this.convertRefToModel(mimeType.properties)};
					break;
				case 'multipart/form-data':
				case 'application/x-www-form-urlencoded':
					data.body = {
						type: 'object',
						properties: {},
						required: [],
					};
					var formParams = mimeType.properties;
					for (var j in formParams) {
						if (!formParams.hasOwnProperty(j)) continue;
						var param = formParams[j];
						var bodyType = !_.isEmpty(param.type) ? param.type[0] : param.type;
						data.body.properties[param.name] = {
							type: bodyType,
						};
						if (param.description) {
							data.body.properties[param.name].description = param.description;
						}
						if (param.format) {
							data.body.properties[param.name].format = param.format;
						}
						if (param.required === true) {
							data.body.required.push(param.name);
						}
					}
					break;
				default:
			}
		} else if (mimeType.schema && !_.isEmpty(mimeType.schema)) {
			data.body = this.convertRefToModel({
				type: mimeType.schema[0],
			});
		} else if (mimeType.type && !_.isEmpty(mimeType.type) && mimeType.type[0] !== 'object') {
			data.body = this.convertRefToModel({
				type: mimeType.type[0],
			});
		}
	}
	return data;
};


RAML10.prototype.mapSchema = function(schemData) {
	var schemas = [];
	for (var i in schemData) {
		if (!schemData.hasOwnProperty(i)) continue;
		for (var schemaName in schemData[i]) {
			if (!schemData[i].hasOwnProperty(schemaName)) continue;
			var sd = new Schema(schemaName);
			sd.Name = schemaName;
			var definition = schemData[i][schemaName];
			var data = null;
			if (definition.properties && !_.isEmpty(definition.properties)) {
				data = {
					properties: {},
					type: 'object',
					required: [],
				};
				if (definition.description) {
					data.description = definition.description;
				}
				for (var paramName in definition.properties) {
					if (!definition.properties.hasOwnProperty(paramName)) continue;
					var param = definition.properties[paramName];
					data.properties[paramName] = param;
					if (param.hasOwnProperty('required')) {
						if (param.required === true) {
							data.required.push(paramName);
						}
						delete param.required;
					} else {
						// required true by default.
						data.required.push(paramName);
					}
				}
				if (data.required && data.required.length === 0) {
					delete data.required;
				}
			}
			if (definition.type && definition.type !== 'object') { // type
				if (data) { // type and properties
					definition.allOf = definition.type;
					definition.allOf.push(data);
					delete definition.type;
					delete definition.properties;
				} else if (_.isArray(definition.type) && definition.type.length > 1) {
					definition.allOf = definition.type;
					delete definition.type;
				} else {
					definition = jsonHelper.parse(_.isArray(definition.type) ? definition.type[0] : definition.type);
				}
			} else { // only properties
				definition = data;
			}
			sd.Definition = this.convertRefToModel(definition);
			schemas.push(sd);
		}
	}
	return schemas;
};

RAML10.prototype.getSchema = function(data) {
    return data.types;
};

RAML10.prototype.description = function(project, data) {
	if (data.description) {
		project.Description = data.description;
	}
};

module.exports = RAML10;
