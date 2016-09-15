var RAML = require('./baseraml'),
    Schema = require('../entities/schema'),
    jsonHelper = require('../utils/json'),
    YAML = require('js-yaml');

function RAML08() {}
RAML08.prototype = new RAML();

RAML08.prototype.mapRequestBody = function(methodBody) {
  var data = {mimeType: '', body: {}, example: ''};

  //TODO: only one, the latest is in effect in stoplight!
  for (var i in methodBody) {
    var mimeType = methodBody[i];

    data.mimeType = mimeType.name();
    if (mimeType.example()) {
      data.example = mimeType.example().value();
    }

    if (mimeType.formParameters()) {
      data.body = {
        type: 'object',
        'properties': {},
        'required': []
      };
      var formParams = mimeType.formParameters();
      for (var j in formParams) {
        var param = formParams[j];
        var definition = jsonHelper.parse(YAML.load(param.dump()));

        for (var paramId in definition) {
          var paramValue = definition[paramId];
          data.body.properties[paramId] = paramValue;

          if (paramValue.required && paramValue.required) {
            data.body.required.push(paramId);
          }
        }
      }
    }
    if (mimeType.schema && mimeType.schema()) {
      data.body = jsonHelper.parse(YAML.load(mimeType.dump())[mimeType.name()].schema);
    }
  }

  return data;
};

RAML08.prototype.mapSchema = function(schemData) {
    var schemas = [];
    for (var i in schemData) {
        var schema = schemData[i];
        var schemaName = schema.key();
        var sd = new Schema(schemaName);
        sd.Name = schemaName;
        sd.Definition = RAML08.prototype.convertRefToModel(jsonHelper.parse(YAML.load(schema.dump())[schemaName]));

        schemas.push(sd);
    }
    return schemas;
};

RAML08.prototype.getSchema = function (data) {
    return data.schemas();
};

module.exports = RAML08;
