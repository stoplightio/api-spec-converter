var expect   = require('chai').expect,
    RAML = require('../../../lib/importers/raml');

describe('RAML Importer', function(){
  var ramlImporter;
  beforeEach(function(){
    ramlImporter = new RAML();
  });

  describe('constructor', function(){
    it('should return new RAML importer instance successfully', function(){
      expect(ramlImporter).to.be.instanceOf(RAML);
    });
    it('should possess generic importer prototype', function(){
      expect(ramlImporter).to.respondTo('loadFile');
      expect(ramlImporter).to.respondTo('loadData');
      expect(ramlImporter).to.respondTo('_import');
      expect(ramlImporter).to.respondTo('import');
    });
  });
  describe('loadFile', function(){
    it('should be able to load a valid yaml file');
    it('should return error for invalid file');
  });
  describe('_import', function(){
    it('should perform import operation on loaded data');
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
