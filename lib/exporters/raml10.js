var RAML = require('./baseraml'),
    jsonHelper = require('../utils/json'),
    ramlHelper = require('../helpers/raml'),
    _ = require('lodash');

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
    return mediaTypes.length ? mediaTypes:null;
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
    }
    return ag;
};

RAML10.prototype.mapRequestBodyJson = function(bodyData) {
    return {
        example: bodyData.example ? jsonHelper.format(bodyData.example) : '',
        type: bodyData.body
    };
};

RAML10.prototype.mapRequestBodyForm = function(bodyData) {
    var body = {
        properties: bodyData.properties
    };

    /**
     * Two different approaches to declare an optional parameter.
     * source https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md#property-declarations
     * a) appending '?' to property name (without declaring required parameter).
     * b) set required = false
     */
    for (var i in body.properties) {
        var property = body.properties[i];
        property.required = false;
    }

    if (bodyData.required && bodyData.required.length > 0) {
        for(var j in bodyData.required) {
            var requiredParam = bodyData.required[j];
            if (body['properties'][requiredParam]) {
                body['properties'][requiredParam].required = true;
            }
        }
    }

    return body;
};

RAML10.prototype.mapResponseBody = function(bodyData) {
  var body = {};
  var type = jsonHelper.format(bodyData.body);
  var example = jsonHelper.format(bodyData.example);

  if (type) {
    body.type = type;
  }

  if (example) {
    body.example = example;
  }

  return body;
};

RAML10.prototype.addSchema = function(ramlDef, schema) {
    ramlDef.types = schema;
};

RAML10.prototype.mapSchema = function(slSchemas) {
    var results = {};

    if (slSchemas) {
      for (var i in slSchemas) {
          var schema = slSchemas[i];
          var definition = RAML10.prototype.convertRefAttFromObject(schema.Definition);
          results[schema.NameSpace] = definition;
      }
    }

    return results;
};

RAML10.prototype.mapOperation = function(method) {
    return method;
};

RAML10.prototype.mapSecuritySchemes = function(securitySchemes) {
  var result = {};

  if (securitySchemes.hasOwnProperty('oauth2')) {
    var name = securitySchemes.oauth2.name || 'oauth_2_0';
    // missing describedBy, description

    result[name] = {
      type: 'OAuth 2.0',
      settings: {
        authorizationUri: securitySchemes.oauth2.authorizationUrl,
        accessTokenUri: securitySchemes.oauth2.tokenUrl,
        authorizationGrants: this.mapAuthorizationGrants(securitySchemes.oauth2.flow)
      }
    };
  }

  if (securitySchemes.hasOwnProperty('basic')) {
    var basicName = securitySchemes.basic.name;

    if (basicName) {
      result[basicName] = {
        type: 'Basic Authentication',
        description: securitySchemes.basic.description || ''
      };
    }
  }

  return result;
};

module.exports = RAML10;
