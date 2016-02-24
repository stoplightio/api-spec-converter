var expect   = require('chai').expect,
    Swagger = require('../../../lib/exporters/swagger'),
    Schema = require('../../../lib/entities/schema'),
    parser = require('swagger-parser'),
    fs = require('fs');

describe('Swagger Exporter', function(){
  var swaggerExporter;
  beforeEach(function(){
    swaggerExporter = new Swagger();
  });

  describe('constructor', function(){
    it('should return valid Swagger instance', function(){
      expect(swaggerExporter).to.be.instanceof(Swagger);
    });
    it('should posess generic exporter prototype', function(){
      expect(swaggerExporter).to.respondTo('loadSLData');
      expect(swaggerExporter).to.respondTo('loadProject');
      expect(swaggerExporter).to.respondTo('_export');
      expect(swaggerExporter).to.respondTo('export');
      expect(swaggerExporter).to.respondTo('_getData');
    });
  });

  describe('_export', function(){
    it('should perform export for loaded data', function(done){
      swaggerExporter.loadSLData(require(__dirname+'/../../data/stoplight.json'), function(err){
        expect(err).to.equal(undefined);
        swaggerExporter.export('yaml')
        .then(function(exportedData){
          fs.writeFileSync('temp.yaml', exportedData, 'utf8');
          parser.parse('temp.yaml')
          .then(function(api, metadata) {
            done();
          })
          .catch(function(err) {
            expect(err).to.equal(undefined);
            done();
          });
        })
        .catch(function(err){
          done(err);
        });
      });
    });
  });

  //TODO test internal methods individually
  it('shouldn\'t throw error if param json schema required attribute doesn\'t exist');

  it('shouldn\'t contain duplicate produces values');

  describe('_mapSecurityDefinitions', function(){
    it('should map apiKey security definitions to stoplight successfully');
    it('should map oauth2 security definitions to stoplight successfully');
    it('should map basic security definitions to stoplight successfully');
  });

  describe('_mapRequestBody', function(){
    it('should map map request body params and return successfully', function(){
      var stoplightParams = {
        'type': 'object',
        'properties': {
          'id': {
            'description': 'The photo ID',
            'type': 'string'
          },
          'photo': {
            'description': 'The pet photo',
            'type': 'string'
          }
        },
        'required': [
          'photo'
        ]
      };
      var stoplightBody = {
        body: JSON.stringify(stoplightParams)
      };

      var params = swaggerExporter._mapRequestBody(stoplightBody);
      expect(params).to.not.be.undefined;
      expect(params.length).to.be.equal(1);
    });

    it('should map as formData param for file type prop existence', function(){
      var stoplightParams = {
        'type': 'object',
        'properties': {
          'id': {
            'description': 'The photo ID',
            'type': 'string'
          },
          'photo': {
            'description': 'The pet photo',
            'type': 'file'
          }
        },
        'required': [
          'photo'
        ]
      };
      var stoplightBody = {
        body: JSON.stringify(stoplightParams)
      };

      var params = swaggerExporter._mapRequestBody(stoplightBody);
      expect(params).to.not.be.undefined;
      expect(params.length).to.be.equal(2);
      expect(params[0].name).to.be.equal('id');
      expect(params[1].required).to.be.equal(true);
    });

    describe('_mapSchema', function(){
      it('should able to parse sl schemas to swagger schemas as key/schema structure', function(){
        var schemas = [], schema1, schema2, mappedSchemas;

        schema1 = new Schema('abcd');
        schema1.Definition = JSON.stringify({
          type: 'object',
          properties:
            {myField:
              {
                type: 'string'
              }
            },
            required: []
          });
        schemas.push(schema1);

        schema2 = new Schema('abcd2');
        schema2.Definition = JSON.stringify({
          type: 'object',
          properties:
            {myField:
              {
                type: 'string'
              }
            },
            required: []
        });
        schemas.push(schema2);

        mappedSchemas = swaggerExporter._mapSchema(schemas);
        expect(Object.keys(mappedSchemas).length).equal(2);
        expect(mappedSchemas.abcd).to.be.an('object');
      });
    });

    describe('_mapSecurityDefinitions', function(){
      it('should able to parse sl security schemes to swagger security definitions', function(){
        var schemes = {
          'apiKey' : {
              'headers' : [
                  {
                      'name' : 'api_key',
                      'value' : ''
                  }
              ]
          },
          'oauth2' : {
              'name' : 'petstore_auth',
              'authorizationUrl' : 'http://swagger.io/api/oauth/dialog',
              'scopes' : [
                  {
                      'name' : 'write:pets',
                      'value' : 'modify pets in your account'
                  },
                  {
                      'name' : 'read:pets',
                      'value' : 'read your pets'
                  }
              ],
              'tokenUrl' : '',
              'flow' : 'implicit'
          },
          'basic' : {
              'name' : 'test',
              'value' : '',
              'description' : ''
          }
        };

        var schema1, schema2, mappedSchemes;

        mappedSchemes = swaggerExporter._mapSecurityDefinitions(schemes);
        expect(Object.keys(mappedSchemes).length).equal(3);
      });
    });

    describe('_validateParameters', function(){
      it('should truncate not valid parameters', function(){
        var parameters = [
          {
            name : 'myparam',
            in: 'header',
            type: 'abcd'
          }
        ];
        parameters = swaggerExporter._validateParameters(parameters);
        expect(parameters.length).equal(1);

        //should assign string type for non valid types
        expect(parameters[0].type).equal('string');
      });
    });
  });
});
