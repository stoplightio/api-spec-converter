var slConverter = require('../index'),
    fs = require('fs');

var swaggerConverter = new slConverter.Converter(slConverter.Formats.SWAGGER, slConverter.Formats.SWAGGER);
var filePath = __dirname + '/source/swagger.yaml';
var data = fs.readFileSync(filePath, 'utf8');

swaggerConverter.loadData(data)
.then(function(){
    swaggerConverter.convert('yaml', function(err, exportedData){
      if (err) {
        return console.log(err);
      }
      fs.writeFileSync(__dirname + '/target/swagger.yaml', exportedData, 'utf8');
    });
})
.catch(function(err){
  if(err) {
    return console.log(err);
  }
});


