var expect   = require('chai').expect,
    swaggerImporter = require('../../../lib/importers/postman');

describe('Swagger Importer', function(){
  describe('constructor', function(){
    it('should return new Swagger importer instance successfully');
    it('should possess generic importer prototype');
  });
  describe('loadFile', function(){
    it('should be able to load a valid json file');
    it('should be able to load a valid yaml file');
    it('should return error for invalid file');
  });
  describe('_import', function(){
    it('should perform import operation on loaded data');
  });

  //TODO write test for internal functions
});
