var expect   = require('chai').expect,
    Postman = require('../../../lib/importers/postman'),
    Project = require('../../../lib/entities/project');

describe('Postman Importer', function(){
  var postmanImporter;
  beforeEach(function(){
    postmanImporter = new Postman();
  });
  describe('constructor', function(){
    it('should return new postman importer instance successfully', function(){
      expect(postmanImporter).to.be.instanceOf(Postman);
    });
    it('should possess generic importer prototype', function(){
      expect(postmanImporter).to.respondTo('loadFile');
      expect(postmanImporter).to.respondTo('loadData');
      expect(postmanImporter).to.respondTo('_import');
      expect(postmanImporter).to.respondTo('import');
    });
  });
  describe('loadFile', function(){
    it('should be able to load a valid json file', function(done){
      postmanImporter.loadFile(__dirname+'/../../data/postman.json', function(){
        done();
      });
    });
    it('should return error for invalid json file', function(done){
      postmanImporter.loadFile(__dirname+'/../../data/invalid/postman.json', function(err){
        try {
          expect(err).to.not.equal(undefined);
          //TODO error message comparisn
          done();
        } catch(err) {
          done(err);
        }
      });
    });
    it('should return error for valid json, but invalid formatted postman definition file');
  });
  describe('_import', function(){
    it('should perform import operation on loaded data', function(){
      postmanImporter.loadFile(__dirname+'/../../data/postman.json', function(){
        var slProject = postmanImporter.import();
        expect(slProject).to.be.instanceOf(Project);
      });
    });
  });

  describe('middleware', function(){
    it('should support before/after middleware import');
  });

  //TODO write test for internal functions
});
