var expect   = require('chai').expect,
    RAML = require('../../../lib/exporters/raml'),
    fs = require('fs'),
    parser = require('raml-parser');

describe('RAML Exporter', function(){

  var ramlExporter, slData;
  beforeEach(function(){
    ramlExporter = new RAML();
    slData = require(__dirname+'/../../data/stoplight.json');
  });

  describe('constructor', function(){
    it('should return valid raml instance', function(){
      expect(ramlExporter).to.be.instanceOf(RAML);
    });
    it('should posess generic exporter prototype', function(){
      expect(ramlExporter).to.respondTo('loadSLData');
      expect(ramlExporter).to.respondTo('loadProject');
      expect(ramlExporter).to.respondTo('_export');
      expect(ramlExporter).to.respondTo('export');
      expect(ramlExporter).to.respondTo('_getData');
    });
  });

  describe('_export', function(){
    it('should perform export for loaded data', function(){
      ramlExporter.loadSLData(slData, function(err){
        expect(err).to.be.undefined;
        var ramlData = ramlExporter.export('yaml');
        expect(ramlData).to.not.be.empty;
        //verify its valid raml data
        parser.load(ramlData).then(function(data) {
          done();
        }, function(error) {
          expect(error).to.be.equal(undefined);
          done();
        });
      });
    });
  });

  describe('_getData', function(){
    it('should contain custom implementation as doesn\'t support json export', function(){
      ramlExporter.loadSLData(slData, function(err){
        expect(err).to.be.undefined;
        try {
          var ramlData = ramlExporter.export('json');
          //force fail as not expected
          expect(true).to.be.equal(false);
        }
        catch(err) {
          expect(err).to.not.equal(undefined);
        }
      });
    });
  });
  //TODO test internal methods individually

  it('shouldn\'t throw error if param json schema required attribute doesn\'t exist');
});
