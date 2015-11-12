var expect   = require('chai').expect,
    specConverter = require('../index');

describe('index', function() {

    it('should expose converter api', function(){
      expect(specConverter.Converter).to.be.a('Function');
    });

    describe('formats', function(){
      it('should expose supported formats', function(){
        expect(specConverter.Formats).to.be.a('Object');
      });
      it('should be raml supported', function(){
        expect(specConverter.Formats.RAML).to.be.a('Object');
      });
      it('should be swagger supported', function(){
        expect(specConverter.Formats.SWAGGER).to.be.a('Object');
      });
      it('should be postman supported', function(){
        expect(specConverter.Formats.POSTMAN).to.be.a('Object');
      });
      it('should be stoplight supported', function(){
        expect(specConverter.Formats.STOPLIGHT).to.be.a('Object');
      });
    });

    describe('exporters', function(){
      it('should expose raml exporter api', function(){
        var exporterInstance = new specConverter.Exporter.factory(specConverter.Formats.RAML);
        expect(exporterInstance).to.be.an.instanceof(require('../lib/exporters/raml'));
      });
      it('should expose swagger exporter api', function(){
        var exporterInstance = new specConverter.Exporter.factory(specConverter.Formats.SWAGGER);
        expect(exporterInstance).to.be.an.instanceof(require('../lib/exporters/swagger'));
      });
      it('should expose stoplight exporter api', function(){
        var exporterInstance = new specConverter.Exporter.factory(specConverter.Formats.STOPLIGHT);
        expect(exporterInstance).to.be.an.instanceof(require('../lib/exporters/stoplight'));
      });
    });

    describe('importers', function(){
      it('should expose raml importer api', function(){
        var importerInstance = new specConverter.Importer.factory(specConverter.Formats.RAML);
        expect(importerInstance).to.be.an.instanceof(require('../lib/importers/raml'));
      });
      it('should expose swagger importer api', function(){
        var importerInstance = new specConverter.Importer.factory(specConverter.Formats.SWAGGER);
        expect(importerInstance).to.be.an.instanceof(require('../lib/importers/swagger'));
      });
      it('should expose postman importer api', function(){
        var importerInstance = new specConverter.Importer.factory(specConverter.Formats.POSTMAN);
        expect(importerInstance).to.be.an.instanceof(require('../lib/importers/postman'));
      });
      it('should expose stoplight importer api', function(){
        var importerInstance = new specConverter.Importer.factory(specConverter.Formats.STOPLIGHT);
        expect(importerInstance).to.be.an.instanceof(require('../lib/importers/stoplight'));
      });
    });
});
