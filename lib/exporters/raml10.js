var _ = require('lodash');
var RAML = require('./baseraml');
var jsonHelper = require('../utils/json');

function RAML10() {}
RAML10.prototype = new RAML();

RAML10.prototype.version = function() {
    return '1.0';
};


RAML10.prototype.mapMediaType = function(consumes, produces) {
    var mediaTypes = [];
    if (consumes && consumes.length > 0) {
        mediaTypes = consumes;
    }

    if (_.isArray(produces)) {
        mediaTypes = mediaTypes.concat(produces);
    }
    mediaTypes = _.uniq(mediaTypes);
    if (mediaTypes.length === 1) {
        return mediaTypes[0];
    }
    return mediaTypes.length ? mediaTypes : null;
};

RAML10.prototype.mapAuthorizationGrants = function(flow) {
    var ag = [];
    switch (flow) {
        case 'implicit':
            ag = ['implicit'];
            break;
        case 'password':
            ag = ['password'];
            break;
        case 'application':
            ag = ['client_credentials'];
            break;
        case 'accessCode':
            ag = ['authorization_code'];
            break;
			  default:
						break;
    }
    return ag;
};

RAML10.prototype.mapBody = function(bodyData) {
    var result = this.convertRefFromModel(jsonHelper.parse(bodyData.body));
    if (bodyData.example) {
        result.example = jsonHelper.format(bodyData.example);
    }
    return result;
};

RAML10.prototype.mapRequestBodyForm = function(bodyData) {
	var i;
	var property;
	var j;
	var requiredParam;
    var body = {
        properties: bodyData.properties,
    };

    /**
     * Two different approaches to declare an optional parameter.
     * source https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md#property-declarations
     * a) appending '?' to property name (without declaring required parameter).
     * b) set required = false
     */
    for (i in body.properties) {
        if (!{}.hasOwnProperty.call(body.properties, i)) continue;
        property = body.properties[i];
        property.required = false;
    }

    if (bodyData.required && bodyData.required.length > 0) {
        for (j in bodyData.required) {
            if (!{}.hasOwnProperty.call(bodyData.required, j)) continue;
            requiredParam = bodyData.required[j];
            if (body.properties[requiredParam]) {
                body.properties[requiredParam].required = true;
            }
        }
    }

    return body;
};

RAML10.prototype.addSchema = function(ramlDef, schema) {
    ramlDef.types = schema;
};

RAML10.prototype.mapSchema = function(slSchemas) {
	var i;
	var schema;
	var definition;
	var allOfTypes;
	var allOf;
	var j;
    var results = {};
    for (i in slSchemas) {
        if (!{}.hasOwnProperty.call(slSchemas, i)) continue;
        schema = slSchemas[i];
        definition = this.convertRefFromModel(jsonHelper.parse(schema.Definition));
		if (definition.allOf) {
			allOfTypes = [];
			for (j in definition.allOf) {
				if (!{}.hasOwnProperty.call(definition.allOf, j)) continue;
				allOf = definition.allOf[j];
				if (allOf.properties) {
					definition = this.mapSchemaProperties(allOf);
                    break;
				}
				if (allOf.type) {
					allOfTypes.push(allOf.type);
				}
			}
			definition.type = allOfTypes.length > 1 ? allOfTypes : allOfTypes[0];
			delete definition.allOf;
		} else if (definition.properties) {
			definition = this.mapSchemaProperties(definition);
		}
		if (schema.example) {
			definition.example = jsonHelper.parse(schema.example);
		}
		results[schema.NameSpace] = definition;
    }
    return results;
};

RAML10.prototype.mapSchemaProperties = function(definition) {
	var k;
	var property;
	var j;
	var requiredParam;
	for (k in definition.properties) {
		if (!{}.hasOwnProperty.call(definition.properties, k)) continue;
		property = definition.properties[k];
		property.required = false;
	}
	if (definition.required && definition.required.length > 0) {
		for (j in definition.required) {
			if (!{}.hasOwnProperty.call(definition.required, j)) continue;
			requiredParam = definition.required[j];
			if (definition.properties[requiredParam]) {
				delete definition.properties[requiredParam].required;
				// definition['properties'][requiredParam].required = true;
			}
		}
		delete definition.required;
	}
	if (definition.additionalProperties) {
		definition.properties['//'] = definition.additionalProperties;
		delete definition.additionalProperties;
	}
	if (definition.properties && definition.type === 'object') {
		delete definition.type;
	}
	return definition;
};

RAML10.prototype.description = function(ramlDef, project) {
	ramlDef.description = project.Description;
};

RAML10.prototype.getApiKeyType = function() {
	return 'Pass Through';
};

RAML10.prototype.mapSecuritySchemes = function(securitySchemes) {
	return securitySchemes;
};

RAML10.prototype.setMethodDisplayName = function(method, displayName) {
	method.displayName = displayName;
};

module.exports = RAML10;
