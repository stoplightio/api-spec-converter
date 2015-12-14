var expect   = require('chai').expect,
    Swagger = require('../../../lib/exporters/swagger'),
    parser = require('swagger-parser'),
    fs = require('fs');

describe('Swagger Exporter', function(){
  var swaggerExporter;
  beforeEach(function(){
    swaggerExporter = new Swagger();
  });

  describe('constructor', function(){
    it('should return valid Swagger instance', function(){
      expect(swaggerExporter).to.be.instanceof(Swagger);
    });
    it('should posess generic exporter prototype', function(){
      expect(swaggerExporter).to.respondTo('loadSLData');
      expect(swaggerExporter).to.respondTo('loadProject');
      expect(swaggerExporter).to.respondTo('_export');
      expect(swaggerExporter).to.respondTo('export');
      expect(swaggerExporter).to.respondTo('_getData');
    });
  });

  describe('_export', function(){
    it('should perform export for loaded data', function(done){
      swaggerExporter.loadSLData(require(__dirname+'/../../data/stoplight.json'));
      var exportedData = swaggerExporter.export('yaml');
      fs.writeFileSync('temp.yaml', exportedData, 'utf8');
      parser.parse('temp.yaml')
      .then(function(api, metadata) {
        done();
      })
      .catch(function(err) {
        expect(err).to.equal(undefined);
        done();
      });
    });
  });

  //TODO test internal methods individually
  it('shouldn\'t throw error if param json schema required attribute doesn\'t exist');

  it('shouldn\'t contain duplicate produces values');
});
