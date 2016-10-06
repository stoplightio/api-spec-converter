var RAML = require('./baseraml');
var Schema = require('../entities/schema');
var jsonHelper = require('../utils/json');
var Text = require('../entities/text');

function RAML08() {}
RAML08.prototype = new RAML();

RAML08.prototype.mapRequestBody = function(methodBody) {
  var i;
  var mimeType;
  var formParams;
  var j;
  var param;
  var data = {mimeType: '', body: {}, example: ''};
  // TODO: only one, the latest is in effect in stoplight!
  for (i in methodBody) {
    if (!{}.hasOwnProperty.call(methodBody, i)) continue;
    mimeType = methodBody[i];
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
      formParams = mimeType.formParameters;
      for (j in formParams) {
        if (!{}.hasOwnProperty.call(formParams, j)) continue;
        param = formParams[j];
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
  var i;
  var schemaName;
  var sd;
  for (i in schemData) {
    if (!{}.hasOwnProperty.call(schemData, i)) continue;
    for (schemaName in schemData[i]) {
      if (!{}.hasOwnProperty.call(schemData[i], schemaName)) continue;
      sd = new Schema(schemaName);
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
  var i;
  var doc;
  var txt;
  var documentation = data.documentation;
  if (documentation && documentation.length > 0) {
    project.Description = documentation[0].content;
    project.Environment.summary = documentation[0].content;
  }

  // text sections
  if (documentation) {
    for (i in documentation) {
      if (!{}.hasOwnProperty.call(documentation, i)) continue;
      doc = documentation[i];
      txt = new Text(doc.title);
      txt.Public = true;
      txt.Content = doc.content;
      this.project.addText(txt);
    }
  }
};

module.exports = RAML08;
