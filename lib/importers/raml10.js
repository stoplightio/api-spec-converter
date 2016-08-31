var RAML = require('./baseraml'),
    Schema = require('../entities/schema'),
    jsonHelper = require('../utils/json'),
    YAML = require('js-yaml');

function RAML10() {}
RAML10.prototype = new RAML();

RAML10.prototype.mapRequestBody = function(methodBody) {
    var data = {body: {}, example: ''};

    //TODO: only one, the latest is in effect in stoplight!
    for (var i in methodBody) {
        var mimeType = methodBody[i];

        if (mimeType.example()) {
            data.example = mimeType.example().value();
        }

        if (mimeType.properties) {
            data.body = {
                type: 'object',
                'properties': {},
                'required': []
            };
            var formParams = mimeType.properties();
            for (var j in formParams) {
                var param = formParams[j];
                data.body.properties[param.name()] = {
                    type: param.type()
                };
                if (param.description()) {
                    data.body.properties[param.name()].description = param.description().value();
                }

                if (param.required() == true) {
                    data.body.required.push(param.name());
                }
            }
        }
        else if (mimeType.schema && Array.isArray(mimeType.schema()) && mimeType.schema().length > 0) {
            data.body = jsonHelper.parse(mimeType.schema()[0]);
        }
        else if (mimeType.type && Array.isArray(mimeType.type()) && mimeType.type().length > 0) {
            data.body = jsonHelper.parse(mimeType.type()[0]);
        }
    }

    return data;
};


RAML10.prototype.mapSchema = function(schemData) {
    var schemas = [];
    for (var i in schemData) {
        var schema = schemData[i];
        var schemaName = schema.name();
        var sd = new Schema(schemaName);
        sd.Name = schemaName;

        var definition;
        if (jsonHelper.isEmptySchema(schema)) {
            definition = YAML.load(schema.dump())[schemaName];
        } else {
            if (schema.type && Array.isArray(schema.type()) && schema.type().length > 0) {
                definition = jsonHelper.parse(schema.type()[0]);
            }
        }
        sd.Definition = RAML10.prototype.convertRefAttFromObject(definition);
        schemas.push(sd);
    }
    return schemas;
};

RAML10.prototype.getSchema = function (data) {
    return data.types();
};

module.exports = RAML10;
