var expect   = require('chai').expect,
    Stoplight = require('../../../lib/exporters/stoplight'),
    Project = require('../../../lib/entities/project');

describe('Stoplight Exporter', function(){
  var exporter;
  before(function(){
    exporter = new Stoplight();
  });
  describe('constructor', function(){
    it('create new instance of Stoplight exporter successfully', function(){
      expect(exporter).to.be.an.instanceof(Stoplight);
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
    it('exported data should have project key', function(){
      exporter.loadProject(new Project('testProject'));
      exporter._export();
      expect(exporter.data).to.include.keys('project');
      expect(exporter.data).to.be.an('object');
    });
  });

  describe('middleware', function(){
    it('should support before/after middleware export');
  });
});
