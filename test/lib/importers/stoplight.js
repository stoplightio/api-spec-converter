var expect   = require('chai').expect,
    Stoplight = require('../../../lib/importers/stoplight'),
    Project = require('../../../lib/entities/project');

describe('Stoplight Importer', function(){
  var importer, slData = require(__dirname + '/../../data/stoplight');;
  before(function(){
    importer = new Stoplight();
  });
  describe('constructor', function(){
    it('create new instance of Stoplight importer successfully', function(){
      expect(importer).to.be.an.instanceof(Stoplight);
    });
  });
  describe('_import', function(){
    it('should export project to data', function(){
      expect(importer.data).to.equal(null);
      //pre-requisite
      importer.loadData(slData);
      importer._import();
      expect(importer.project).to.not.equal(null);
    });
    it('exported data should have at least one endpoint', function(){
      importer.loadData(slData);
      importer._import();
      expect(importer.project.Endpoints.length).to.gt(0);
    });
  });
});
