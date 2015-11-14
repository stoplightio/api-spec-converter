var expect   = require('chai').expect,
    RAML = require('../../../lib/exporters/raml');

describe('RAML Exporter', function(){

  describe('constructor', function(){
    it('should return valid raml instance');
    it('should posess generic exporter prototype');
  });

  describe('_export', function(){
    it('should perform export for loaded data');
  });

  describe('_getData', function(){
    it('should contain custom implementation as doesn\'t support json export');
  });

  //TODO test internal methods individually
});
