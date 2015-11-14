var expect   = require('chai').expect,
    postmanImporter = require('../../../lib/importers/postman');

describe('Postman Importer', function(){
  describe('constructor', function(){
    it('should return new postman importer instance successfully');
    it('should possess generic importer prototype');
  });
  describe('loadFile', function(){
    it('should be able to load a valid json file');
    it('should return error for invalid json file');
  });
  describe('_import', function(){
    it('should perform import operation on loaded data');
  });

  //TODO write test for internal functions
});
