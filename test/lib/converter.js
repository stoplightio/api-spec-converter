var expect   = require('chai').expect,
    specConverter = require('../../index');

describe('Converter', function() {
    describe('constructor', function(){
      it('should successfully create new converter instance', function(){
        var converterInstance = new specConverter.Converter(specConverter.Formats.RAML, specConverter.Formats.RAML);
        expect(converterInstance).to.be.an.instanceof(specConverter.Converter);
      });
      it('should validate from/to format, throw error otherwise', function(done){
        try{
          //doesn't support export/convert to postman format
          var converterInstance = new specConverter.Converter(specConverter.Formats.RAML, specConverter.Formats.POSTMAN);
          expect(converterInstance).to.be.an.instanceof(specConverter.Converter);
        } catch(e) {
          done();
        }
      });
    });
    describe('loadFile', function(){
      it('should successfully load comaptible file');
      it('should throw error for format incompatible file');
    });
    describe('loadData', function(){
      it('should successfully load raw data');
      it('should throw error for format incompatible data');
    });
    describe('convert', function(){
      it('should successfully convert and return converted data');
    });
});
