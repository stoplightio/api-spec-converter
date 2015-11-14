var expect   = require('chai').expect,
    exporterFactory = require('../../../lib/exporters/index');

describe('Exporter Factory', function(){
  describe('hasSupport', function(){
    it('should return true for supported format');
    it('should return false for not supported format');
  });
  describe('factory', function(){
    it('should return valid exporter instance for supported format');
    it('should return null for not supported format');
  });
});
