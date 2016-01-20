var expect   = require('chai').expect,
    StoplightX = require('../../../lib/importers/stoplightx'),
    Project = require('../../../lib/entities/project');

describe('StoplightX Importer', function(){
  var importer, filePath = __dirname + '/../../data/stoplightx.json';
  beforeEach(function(){
    importer = new StoplightX();
  });
  describe('constructor', function(){
    it('create new instance of StoplightX importer successfully', function(){
      expect(importer).to.be.an.instanceof(StoplightX);
    });
  });
  describe('loadFile', function(){
    it('should load a StoplightX definition file successfully', function(done){
      expect(importer.data).to.be.null;
      importer.loadFile(filePath, function(){
        expect(importer.data).not.to.be.null;
        done();
      });
    });
  });
  describe('_import', function(){
    it('should import stoplightx formatted data to project', function(){
      //should be null before mapping
      expect(importer.project).to.equal(null);
      //pre-requisite
      importer.loadFile(filePath, function(err){
        expect(err).to.be.null;
        importer._import();
        expect(importer.project).to.not.equal(null);
        expect(importer.project.Endpoints.length).gt(0);
        done();
      });
    });
  });
  describe('middleware', function(){
    it('should support before/after middleware import');
  });

  describe('mapEndpoint', function(){
    it('should map endpoints successfully');
  });

  describe('mapUtilityFunctions', function(){
    it('should map utility functions successfully');
  });

  describe('mapSecuritySchemes', function(){
    it('should map security schema successfully');
  });

});
