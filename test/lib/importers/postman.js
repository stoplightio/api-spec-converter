var expect = require('chai').expect,
    Postman = require('../../../lib/importers/postman'),
    Project = require('../../../lib/entities/project');
    _ = require('lodash');

describe('Postman Importer', function() {
  var postmanImporter;

  beforeEach(function() {
    postmanImporter = new Postman();
  });

  describe('constructor', function() {
    it('should return new postman importer instance successfully', function() {
      expect(postmanImporter).to.be.instanceOf(Postman);
    });

    it('should possess generic importer prototype', function() {
      expect(postmanImporter).to.respondTo('loadFile');
      expect(postmanImporter).to.respondTo('loadData');
      expect(postmanImporter).to.respondTo('_import');
      expect(postmanImporter).to.respondTo('import');
    });
  });

  describe('loadFile', function() {
    it('should be able to load a valid json file', function(done) {
      postmanImporter.loadFile(__dirname + '/../../data/postman.json', function() {
        done();
      });
    });

    it('should return error for invalid json file', function(done) {
      postmanImporter.loadFile(__dirname + '/../../data/invalid/postman.json', function(err) {
        try {
          expect(err).to.not.equal(undefined);
          //TODO error message comparisn
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should be able to load a remote url', function(done) {
      postmanImporter.loadFile('https://raw.githubusercontent.com/stoplightio/api-spec-converter/master/example/source/postman.json', function(err) {
        if (err)return done(err);
        var slProject = postmanImporter.import();
        expect(slProject).to.be.instanceOf(Project);
        expect(slProject.Endpoints.length).to.gt(0);
        done();
      });
    });

    it('should return error for valid json, but invalid formatted postman definition file');
  });

  describe('_import', function() {
    it('should perform import operation on loaded data', function() {
      postmanImporter.loadFile(__dirname + '/../../data/postman.json', function() {
        var slProject = postmanImporter.import();
        expect(slProject).to.be.instanceOf(Project);
      });
    });

    describe('_mergeEndpoints', function() {
      it('should merge similar endpoints', function() {
        postmanImporter.loadFile(__dirname + '/../../data/postman.json', function() {
          var slProject = postmanImporter.import();
          expect(postmanImporter.data.requests.length).to.gt(slProject.Endpoints.length);
        });
      });

      it('should not merge endpoints with different methods', function() {
        postmanImporter.loadFile(__dirname + '/../../data/postman.json', function() {
          var slProject = postmanImporter.import();
          var endpoint = _.find(slProject.endpoints, {
            request: {
              path: 'http://petstore.swagger.io/v2/pet/1467573987135',
              method: 'post'
            }
          });

          expect(endpoint).to.not.equal(undefined);
        });
      });

      it('should merge headers', function() {
        postmanImporter.loadFile(__dirname + '/../../data/postman.json', function() {
          var slProject = postmanImporter.import();
          var endpoint = _.find(slProject.endpoints, {
            request: {
              path: 'http://petstore.swagger.io/v2/pet/1467573987135',
              method: 'get'
            }
          });
          var headers = JSON.parse(endpoint.request.headers);

          expect(headers.properties).to.contain.all.keys('header1', 'header2');
        });
      });

      it('should merge query string', function() {
        postmanImporter.loadFile(__dirname + '/../../data/postman.json', function() {
          var slProject = postmanImporter.import();
          var mergedEndpoint = _.find(slProject.endpoints, {
            request: {path: 'http://petstore.swagger.io/v2/pet/1467573987135'}
          });
          var queryString = JSON.parse(mergedEndpoint.request.queryString);

          expect(queryString.properties).to.contain.all.keys('queryparam1', 'queryparam2');
        });
      });
    });
  });

  describe('middleware', function() {
    it('should support before/after middleware import');
  });

  //TODO write test for internal functions
});
