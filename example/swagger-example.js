var slConverter = require('../index'),
    fs = require('fs');

var swaggerConverter = new slConverter.Converter(slConverter.Formats.SWAGGER, slConverter.Formats.SWAGGER);
var data = fs.readFileSync(__dirname + '/source/swagger.yaml', 'utf8');

swaggerConverter.loadData(data, function(err){
  if(err) {
    return console.log(err);
  }
  try{
    swaggerConverter.convert('yaml', function(err, exportedData){
      if (err) {
        return console.log(err);
      }
      fs.writeFileSync(__dirname + '/target/swagger.yaml', exportedData, 'utf8');
    });
  }
  catch(err) {
    console.log(err.stack);
  }
});
