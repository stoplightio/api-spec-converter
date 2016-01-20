var expect   = require('chai').expect,
    StoplightX = require('../../../lib/exporters/stoplightx'),
    Project = require('../../../lib/entities/project');

describe('Stoplight Exporter', function(){
  var exporter;
  before(function(){
    exporter = new StoplightX();
  });
  describe('constructor', function(){
    it('create new instance of StoplightX exporter successfully', function(){
      expect(exporter).to.be.an.instanceof(StoplightX);
    });
  });
  describe('_export', function(){
    it('should export project to data', function(){
      expect(exporter.data).to.equal(null);
      //pre-requisite
      exporter.loadProject(new Project('testProject'));
      exporter._export();
      expect(exporter.data).to.not.equal(null);
    });
    it('exported data should be of swagger format', function(){
      exporter.loadProject(new Project('testProject'));
      exporter._export();
      expect(exporter.data).to.include.keys('swagger');
      expect(exporter.data).to.be.an('object');
    });
  });
});
