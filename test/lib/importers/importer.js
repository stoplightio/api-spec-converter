var expect   = require('chai').expect,
    Importer = require('../../../lib/importers/importer'),
    Project = require('../../../lib/entities/project');

describe('Importer', function(){
  describe('constructor', function(){
    it('should create new importer instance successfully');
  });
  describe('loadFile', function(){
    it('should have unimplemented method that corresponding importer will implement');
  });
  describe('loadData', function(){
    it('should be able to load data directly');
  });
  describe('_import', function(){
    it('should have  unimplemented _import method, throw error upon called');
  });
  describe('import', function(){
    it('should perform import and return imported project entity');
    it('should return error if data not loaded');
    it('should set mapped flag so that multiple call doesn\'t cause all calculation over again');
  });
});
