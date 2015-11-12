var slConverter = require('../index'),
    fs = require('fs'),
    slConverter = new slConverter.Converter(slConverter.Formats.STOPLIGHT, slConverter.Formats.STOPLIGHT);

try {
  slConverter.loadFile(__dirname + '/exported-stoplight.json', function(){
    try{
      fs.writeFileSync(__dirname + '/exported-stoplight2.json', JSON.stringify(slConverter.convert('json'), null, 2), 'utf8');
    }
    catch(err) {
      console.log(err.stack);
    }
  });
}
catch(err) {
  console.log('Error', err);
}
