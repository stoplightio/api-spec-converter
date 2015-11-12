var slConverter = require('../index'),
    fs = require('fs'),
    slConverter = new slConverter.Converter(slConverter.Formats.STOPLIGHT, slConverter.Formats.STOPLIGHT);

try {
  slConverter.loadFile(__dirname + '/stoplight.json', function(){
    try{
      console.log(slConverter.convert('json'));
      fs.writeFileSync(__dirname + '/exported-stoplight.json', slConverter.convert('json'), 'utf8');
    }
    catch(err) {
      console.log(err.stack);
    }
  });
}
catch(err) {
  console.log('Error', err);
}
