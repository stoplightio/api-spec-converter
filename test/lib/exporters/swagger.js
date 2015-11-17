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
    it('should return valid Swagger instance');
    it('should posess generic exporter prototype');
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
});
