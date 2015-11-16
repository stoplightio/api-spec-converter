var expect   = require('chai').expect,
    Swagger = require('../../../lib/importers/swagger'),
    Project = require('../../../lib/entities/project');

describe('Swagger Importer', function(){
  var swaggerImporter;
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
      swaggerImporter.loadFile(__dirname+'/../../data/swagger.yaml', function(){
        done();
      });
    });
    it('should be able to load a valid yaml file', function(){
      swaggerImporter.loadFile(__dirname+'/../../data/swagger.yaml', function(){
        done();
      });
    });
    it('should return error for invalid file', function(done){
      swaggerImporter.loadFile(__dirname+'/../../data/invalid/swagger.json', function(err){
        expect(err).to.not.equal(undefined);
        done();
      });
    });
  });
  describe('import', function(){
    it('should perform import operation on loaded data', function(){
      swaggerImporter.loadFile(__dirname+'/../../data/swagger.json', function(){
        var slProject = swaggerImporter.import();
        expect(slProject).to.be.instanceOf(Project);
      });
    });
  });

  //TODO write test for internal functions
});
