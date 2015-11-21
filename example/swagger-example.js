var slConverter = require('../index'),
    fs = require('fs');

var swaggerConverter = new slConverter.Converter(slConverter.Formats.SWAGGER, slConverter.Formats.SWAGGER);

swaggerConverter.loadFile(__dirname + '/source/swagger.yaml', function(){
  try{
    fs.writeFileSync(__dirname + '/target/swagger.yaml', swaggerConverter.convert('yaml'), 'utf8');
  }
  catch(err) {
    console.log(err.stack);
  }
});
