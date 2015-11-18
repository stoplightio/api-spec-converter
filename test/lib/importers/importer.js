var expect   = require('chai').expect,
    Importer = require('../../../lib/importers/importer'),
    Project = require('../../../lib/entities/project');

describe('Importer', function(){
  var importer, filePath = __dirname + '/../../data/stoplight.json';
  beforeEach(function(){
    importer = new Importer();
  });

  describe('constructor', function(){
    it('should create new importer instance successfully', function(){
      expect(importer).to.be.instanceof(Importer);
    });
  });
  describe('loadFile', function(){
    it('should have unimplemented method that corresponding importer will implement', function(){
      try {
        importer.loadFile(filePath);
        expect(true).to.be.false;
      }
      catch(err) {
        expect(err).to.be.instanceof(Error);
      }
    });
  });
  describe('loadData', function(){
    it('should be able to load data directly', function(){
      expect(importer.loadData(require(filePath))).to.be.true;
    });
  });
  describe('_import', function(){
    it('should have  unimplemented _import method, throw error upon called', function(){
      try {
        importer.data = require(filePath);
        importer._import();
        expect(true).to.be.false;
      }
      catch(err) {
        expect(err).to.be.instanceof(Error);
      }
    });
  });
  describe('import', function(){
    beforeEach(function(){
      importer._import = function(){
        //
      };
    });
    it('should have data loaded flag true if data loaded', function(){
       importer.data = require(filePath);
       expect(importer.IsDataLoaded).to.be.true;
    });
    it('should have data loaded flag false if data not loaded', function(){
       expect(importer.IsDataLoaded).to.be.false;
    });
    it('should return error if data not loaded', function(){
      try {
        importer._import();
        expect(true).to.be.false;
      }
      catch(err) {
        expect(err).to.be.instanceof(Error);
      }
    });
    it('should set mapped flag so that multiple call doesn\'t cause all calculation over again', function(){
      importer.data = require(filePath);
      expect(importer.Mapped).to.be.false;
      importer.import();
      expect(importer.Mapped).to.be.true;
    });
  });
});
