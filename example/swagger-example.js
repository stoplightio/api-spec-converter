var slConverter = require('../index'),
    fs = require('fs');

var ramlConverter = new slConverter.Converter(slConverter.Formats.SWAGGER, slConverter.Formats.SWAGGER);

ramlConverter.loadFile(__dirname + '/source/swagger.yaml', function(){
  try{
    fs.writeFileSync(__dirname + '/target/swagger.json', ramlConverter.convert('json'), 'utf8');
  }
  catch(err) {
    console.log(err.stack);
  }
});
