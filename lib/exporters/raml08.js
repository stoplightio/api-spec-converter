var RAML = require('./baseraml'),
    _ = require('lodash'),
    Schema = require('../entities/schema'),
    jsonHelper = require('../utils/json');

function RAML08() {}
RAML08.prototype = new RAML();

RAML08.prototype.version = function() {
  return '0.8';
};

RAML08.prototype.mapMediaType = function(consumes, produces) {
  var mediaTypes = [];
  if (consumes && consumes.length > 0) {
    mediaTypes = consumes;
  }

  if (_.isArray(produces)) {
    mediaTypes = mediaTypes.concat(produces);
  }
  mediaTypes = _.uniq(mediaTypes);

  return mediaTypes.length ? mediaTypes[0]:null;
};

RAML08.prototype.mapAuthorizationGrants = function(flow) {
  var ag = [];
  switch (flow) {
    case 'implicit':
      ag = ['token'];
      break;
    case 'password':
      ag = ['credentials'];
      break;
    case 'application':
      ag = ['owner'];
      break;
    case 'accessCode':
      ag = ['code'];
      break;
  }
  return ag;
};

RAML08.prototype.mapRequestBodyJson = function(bodyData) {
  var body = {
    schema: bodyData.body
  };

  if (!_.isEmpty(bodyData.example)) {
    body.example = jsonHelper.format(bodyData.example);
  }

  return body;
};

RAML08.prototype.mapRequestBodyForm = function(bodyData) {
  var body = {
      formParameters: bodyData.properties
  };
  if (bodyData.required && bodyData.required.length > 0) {
    for (var i in bodyData.required) {
      var requiredParam = bodyData.required[i];
      if (body['formParameters'][requiredParam]) {
        body['formParameters'][requiredParam].required = true;
      }
    }
  }

  return body;
};

RAML08.prototype.mapResponseBody = function(bodyData) {
  var body = {};
  var schema = jsonHelper.format(bodyData.body);
  var example = jsonHelper.format(bodyData.example);

  if (schema) {
    body.schema = schema;
  }

  if (!_.isEmpty(example)) {
    body.example = example;
  }

  return body;
};

RAML08.prototype.addSchema = function(ramlDef, schema) {
  ramlDef.schemas = schema;
};

// RAML1
RAML08.prototype.mapSchema = function(slSchemas) {
  var results = [];

  if (slSchemas) {
    for (var i in slSchemas) {
      var schema = slSchemas[i];
      var resultSchema = {};
      resultSchema[schema.NameSpace] = jsonHelper.cleanSchema(schema.Definition);
      results.push(resultSchema);
    }
  }

  return results;
};
// RAML08.prototype.mapSchema = function(slSchemas) {
//   var results = [];

//   if (slSchemas) {
//     for (var i in slSchemas) {
//       var schema = slSchemas[i];
//       var resultSchema = {};
//       resultSchema[schema.NameSpace] = RAML08.prototype.convertRefAttFromObject(schema.Definition);
//       results.push(resultSchema);
//     }
//   }

//   return results;
// };

RAML08.prototype.mapOperation = function(method) {
    // In RAML 0.8 displayName property not allowed at operation level (only resource level)
    return _.omit(method, ['displayName']);
};

RAML.prototype.mapSecuritySchemes = function(securitySchemes) {
  var result = [];

  if (securitySchemes.hasOwnProperty('oauth2')) {
    var oauth2Scheme = {};
    var name = securitySchemes.oauth2.name || 'oauth_2_0';
    // missing describedBy, description

    oauth2Scheme[name] = {
      type: 'OAuth 2.0',
      settings: {
        authorizationUri: securitySchemes.oauth2.authorizationUrl,
        accessTokenUri: securitySchemes.oauth2.tokenUrl,
        authorizationGrants: this.mapAuthorizationGrants(securitySchemes.oauth2.flow)
      }
    };

    result.push(oauth2Scheme);
  }

  if (securitySchemes.hasOwnProperty('basic')) {
    var basicScheme = {};
    var basicName = securitySchemes.basic.name;

    if (basicName) {
      basicScheme[basicName] = {
        type: 'Basic Authentication',
        description: securitySchemes.basic.description || ''
      };
    }

    result.push(basicScheme);
  }

  return result;
};

module.exports = RAML08;
