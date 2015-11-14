var expect   = require('chai').expect,
    importerFactory = require('../../../lib/importers/index');

describe('Importer Factory', function(){
  describe('hasSupport', function(){
    it('should return true for supported format');
    it('should return false for not supported format');
  });
  describe('factory', function(){
    it('should return valid exporter instance for supported format');
    it('should return null for not supported format');
  });
});
