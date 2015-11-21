var expect   = require('chai').expect,
    specConverter = require('../../index'),
    fs = require('fs');

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
    it('should validate from format, throw error otherwise', function(done){
      try{

        //set up a fake format
        specConverter.Formats.ABCD = {
          name: 'ABCD',
          className: 'ABCD'
        };

        //doesn't support export/convert from abcd format
        newConverterInstance = new specConverter.Converter(specConverter.Formats.ABCD, specConverter.Formats.POSTMAN);
        expect(newConverterInstance).to.be.an.instanceof(specConverter.Converter);
      } catch(e) {
        expect(e.message).to.equal('from format ABCD not supported');
        done();
      }
    });
    it('should validate to format, throw error otherwise', function(done){
      try{
        //doesn't support export/convert to postman format
        newConverterInstance = new specConverter.Converter(specConverter.Formats.RAML, specConverter.Formats.POSTMAN);
        expect(newConverterInstance).to.be.an.instanceof(specConverter.Converter);
      } catch(e) {
        expect(e.message).to.equal('to format Postman not supported');
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
    it('should throw error for format incompatible file', function(done){
      var fullPath = __dirname + '/../data/postman.json';
      converterInstance.loadFile(fullPath, function(err){
        expect(err).to.not.be.undefined;
        expect(err).to.be.instanceof(Error);
        expect(err.message).to.equal('The first line must be: \'#%RAML 0.8\'');
        done();
      });
    });
  });
  describe('loadData', function(){
    it('should successfully load raw data', function(){
      var fullPath = __dirname + '/../data/raml.yaml';
      content = fs.readFileSync(fullPath, 'utf8');
      var returnVal = converterInstance.loadData(content);
      expect(returnVal).to.be.equal(true);
    });
    it('should throw error for format incompatible data');
  });
  describe('convert', function(){
    it('should successfully convert and return converted data', function(done){
      var fullPath = __dirname + '/../data/raml.yaml';
      converterInstance.loadFile(fullPath, function(){
        try {
          var returnedData = converterInstance.convert('json');
          expect(returnedData).to.be.an('object');
          expect(returnedData).to.include.keys('swagger');
          expect(returnedData.swagger).to.be.equal('2.0');
          done();
        }
        catch(err) {
          done(err);
        }
      });
    });
  });
});
