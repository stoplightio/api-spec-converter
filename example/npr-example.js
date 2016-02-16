var slConverter = require('../index'),
    fs = require('fs');

var swaggerConverter = new slConverter.Converter(slConverter.Formats.SWAGGER, slConverter.Formats.SWAGGER);
var data = fs.readFileSync(__dirname + '/source/npr.json', 'utf8');

swaggerConverter.loadData(data, function(err){
  if(err) {
    return console.log(err);
  }
  try{
    fs.writeFileSync(__dirname + '/target/npr.json', JSON.stringify(swaggerConverter.convert('json'), 'utf8'), null, 4);
  }
  catch(err) {
    console.log(err.stack);
  }
});
