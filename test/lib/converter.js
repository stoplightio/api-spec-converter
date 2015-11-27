var chai   = require('chai'),
    expect = chai.expect,
    specConverter = require('../../index'),
    fs = require('fs');

chai.use(require('chai-string'));

describe('Converter', function() {
  var converterInstance, fullPath = __dirname + '/../data/raml.yaml';
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
      converterInstance.loadFile(fullPath, function(){
        done();
      });
    });
    it('should throw error for format incompatible file', function(done){
      converterInstance.loadFile(__dirname + '/../data/postman.json', function(err){
        expect(err).to.not.be.undefined;
        expect(err).to.be.instanceof(Error);
        expect(err.message).to.equal('The first line must be: \'#%RAML 0.8\'');
        done();
      });
    });
  });

  describe('loadData', function(){
    //current function will work for only stoplight data and postman json data
    it('should successfully load raw data');
    it('should throw error for format incompatible data');
  });

  describe('convert', function(){
    it('should successfully convert and return converted data', function(done){
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
    it('converting from stoplight to stoplight format should be identical', function(done){
      var path = __dirname + '/../data/stoplight.json';
      var originalData = JSON.stringify(require(path));
      newConverterInstance = new specConverter.Converter(specConverter.Formats.STOPLIGHT, specConverter.Formats.STOPLIGHT);
      newConverterInstance.loadFile(path, function(){
        var convertedData = newConverterInstance.convert('json');
        expect(JSON.stringify(convertedData)).to.equal(originalData);
        done();
      });
    });

    it('converting from swagger to swagger format should be identical', function(done){
      /**
      This test include swagger file that is fully compatible with sl spec.
      Of course, for some specific properties, librart won't be able to import , these
      will be documented/listed on library docs
      */
      var path = __dirname + '/../data/swagger.json';
      var originalData = JSON.stringify(require(path), null, 2);
      newConverterInstance = new specConverter.Converter(specConverter.Formats.SWAGGER, specConverter.Formats.SWAGGER);
      newConverterInstance.loadFile(path, function(){
        try {
          var convertedData = newConverterInstance.convert('json');
          expect(JSON.stringify(convertedData, null, 2)).to.equal(originalData);
          done();
        }
        catch(err) {
          done(err);
        }
      });
    });

    //It performs importing from raml to stoplight and exporting from stoplight to raml
    //and thus verifies in both ways
    it('converting from raml to raml format should be identical', function(done){
      /**
      This test include swagger file that is fully compatible with sl spec.
      Of course, for some specific properties, librart usually skips and won't import, these
      will be documented/listed on library docs
      */
      var path = __dirname + '/../data/raml.yaml';
      var originalData = fs.readFileSync(path, 'utf8');
      newConverterInstance = new specConverter.Converter(specConverter.Formats.RAML, specConverter.Formats.RAML);
      newConverterInstance.loadFile(path, function(){
        try {
          var convertedData = newConverterInstance.convert('yaml');
          expect(originalData).to.equalIgnoreSpaces(convertedData);
          done();
        }
        catch(err) {
          done(err);
        }
      });
    });

    it('should convert reversly from swagger to raml without loss', function(done){
      var converter = new specConverter.Converter(specConverter.Formats.SWAGGER, specConverter.Formats.RAML);
      converter.loadFile(__dirname + '/../data/raml-compatible-swagger.json', function(){
        try{
          var covertedRAML = converter.convert('yaml');
          fs.writeFileSync(__dirname + '/../data/temp.yaml', covertedRAML, 'utf8');
          var converter2 = new specConverter.Converter(specConverter.Formats.RAML, specConverter.Formats.SWAGGER);
          converter2.loadFile(__dirname + '/../data/temp.yaml', function(err){
            try{
              if(err) {
                done(err);
                return;
              }
              var resultSwagger = converter2.convert('json');
              expect(resultSwagger).to.deep.equal(require(__dirname + '/../data/raml-compatible-swagger.json'));
              done();
            }
            catch(err) {
              done(err);
            }
          });
        }
        catch(err) {
          done(err);
        }
      });
    });

    it('should convert reversly from raml to swagger without loss', function(done){
      var converter = new specConverter.Converter(specConverter.Formats.RAML, specConverter.Formats.SWAGGER);
      var ramlPath = __dirname + '/../data/swagger-compatible-raml.yaml';
      converter.loadFile(ramlPath, function(){
        try{
          var covertedRAML = converter.convert('yaml');
          fs.writeFileSync(__dirname + '/../data/temp.yaml', covertedRAML, 'utf8');
          var converter2 = new specConverter.Converter(specConverter.Formats.SWAGGER, specConverter.Formats.RAML);
          converter2.loadFile(__dirname + '/../data/temp.yaml', function(err){
            try{
              if(err) {
                done(err);
                return;
              }
              var resultRAML = converter2.convert('yaml');
              fs.writeFileSync(__dirname + '/../data/temp.yaml', resultRAML, 'utf8');
              expect(resultRAML).to.equalIgnoreSpaces(fs.readFileSync(ramlPath, 'utf8'));
              done();
            }
            catch(err) {
              done(err);
            }
          });
        }
        catch(err) {
          done(err);
        }
      });
    });
  });
});
