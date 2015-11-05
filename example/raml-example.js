var slConverter = require('../index')
var fs = require('fs')
var ramlConverter = new slConverter.Converter(slConverter.Formats.RAML, slConverter.Formats.RAML)

try {
  //./source/raml.yaml
  ramlConverter.loadFile('./source/raml.yaml', function(){
    try{
      //console.log(ramlConverter.getSLSchemas())
      fs.writeFileSync(__dirname + '/exported-raml.json', JSON.stringify(ramlConverter.getConvertedData('json'), null, 2), 'utf8')
    }
    catch(err) {
      console.log(err.stack)
    }
  })
}
catch(err) {
  console.log("Error", err)
}

/*var raml = require('raml-parser');

raml.loadFile('./source/raml.yaml').then( function(data) {
  fs.writeFileSync(__dirname + '/raml.json', JSON.stringify(data, null, 2), 'utf8')
}, function(error) {
  console.log('Error parsing: ' + error);
});*/


