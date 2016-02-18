var slConverter = require('../index'),
    fs = require('fs'),
    slConverter = new slConverter.Converter(slConverter.Formats.STOPLIGHTX, slConverter.Formats.STOPLIGHTX);

try {
  slConverter.loadFile(__dirname + '/source/stoplight.json', function(){
    try{
      slConverter.convert('json', function(err, exportedData){
        if (err) {
          return console.log(err);
        }
        fs.writeFileSync(__dirname + '/target/stoplight.json', JSON.stringify(exportedData, null, 4), 'utf8');
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
