var expect   = require('chai').expect,
    specConverter = require('../../index');

describe('Converter', function() {
  var converterInstance;
  beforeEach(function(){
    converterInstance = new specConverter.Converter(specConverter.Formats.RAML, specConverter.Formats.SWAGGER);
  });
  afterEach(function(){
    converterInstance = null;
  });
  describe('constructor', function(){
    it('should successfully create new converter instance', function(){
      expect(converterInstance).to.be.an.instanceof(specConverter.Converter);
    });
    it('should validate from/to format, throw error otherwise', function(done){
      try{
        //doesn't support export/convert to postman format
        newConverterInstance = new specConverter.Converter(specConverter.Formats.RAML, specConverter.Formats.POSTMAN);
        expect(newConverterInstance).to.be.an.instanceof(specConverter.Converter);
      } catch(e) {
        done();
      }
    });
  });
  describe('loadFile', function(){
    it('should successfully load "from"/"importer" comaptible file', function(done){
      var fullPath = __dirname + '/../data/raml.yaml';
      converterInstance.loadFile(fullPath, function(){
        done();
      });
    });
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
