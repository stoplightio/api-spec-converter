var expect   = require('chai').expect,
    Swagger = require('../../../lib/importers/swagger'),
    Project = require('../../../lib/entities/project');

describe('Swagger Importer', function(){
  var swaggerImporter, filePath = __dirname+'/../../data/swagger.yaml';
  beforeEach(function(){
    swaggerImporter = new Swagger();
  });
  describe('constructor', function(){
    it('should return new Swagger importer instance successfully', function(){
      expect(swaggerImporter).to.be.instanceOf(Swagger);
    });
    it('should possess generic importer prototype', function(){
      expect(swaggerImporter).to.respondTo('loadFile');
      expect(swaggerImporter).to.respondTo('loadData');
      expect(swaggerImporter).to.respondTo('_import');
      expect(swaggerImporter).to.respondTo('import');
    });
  });
  describe('loadFile', function(){
    it('should be able to load a valid json file', function(done){
      swaggerImporter.loadFile(__dirname+'/../../data/swagger.json', function(){
        done();
      });
    });
    it('should be able to load a valid yaml file', function(){
      swaggerImporter.loadFile(filePath, function(){
        done();
      });
    });
    it('should return error for invalid file', function(done){
      var invalidPath = __dirname+'/../../data/invalid/swagger.json';
      swaggerImporter.loadFile(invalidPath, function(err){
        expect(err).to.not.equal(undefined);
        expect(err.message).to.equal(invalidPath + ' is not a valid Swagger API definition');
        done();
      });
    });
  });
  describe('import', function(){
    it('should perform import operation on loaded data', function(done){
      swaggerImporter.loadFile(filePath, function(){
        try {
          var slProject = swaggerImporter.import();
          expect(slProject).to.be.instanceOf(Project);
          expect(slProject.Endpoints.length).to.gt(0);
          done();
        }
        catch(err) {
          done(err);
        }
      });
    });
  });

  //TODO write test for internal functions
  describe('_mapSchema', function(){
    it('should map schema data successfully');
  });

  describe('_mapQueryString', function(){
    it('should map query string data successfully');
  });

  describe('_mapURIParams', function(){
    it('should map uri params data successfully');
  });

  describe('_mapRequestBody', function(){
    it('should map request body data successfully');
  });

  describe('_mapResponseBody', function(){
    it('should map response body data successfully');
  });

  describe('_mapRequestHeaders', function(){
    it('should map request header data successfully');
  });
});
