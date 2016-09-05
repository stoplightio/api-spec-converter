var slConverter = require('../index'),
    fs = require('fs'),
    // ramlConverter = new slConverter.Converter(slConverter.Formats.RAML08, slConverter.Formats.RAML10);
    ramlConverter = new slConverter.Converter(slConverter.Formats.RAML08, slConverter.Formats.RAML08);

try {
  //./source/raml.yaml
  ramlConverter.loadFile(__dirname + '/source/raml.yaml', function(err){
    if (err) {
      console.log(err.stack);
      return;
    }
    try{
      ramlConverter.convert('yaml', function(err, exportedData){
        if (err) {
          return console.log(err);
        }
        fs.writeFileSync(__dirname + '/target/raml.yaml', exportedData, 'utf8');
      });
    }
    catch(err) {
      console.log(err.stack);
    }
  });
}
catch(err) {
  console.log('Error', err);
}

/*var raml = require('raml-parser');

raml.loadFile('./source/raml.yaml').then( function(data) {
  fs.writeFileSync(__dirname + '/raml.json', JSON.stringify(data, null, 4), 'utf8')
}, function(error) {
  console.log('Error parsing: ' + error);
});*/


