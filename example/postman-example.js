var slConverter = require('../index'),
    fs = require('fs');

var pmImporter = new slConverter.Importer.factory(slConverter.Formats.POSTMAN);

pmImporter.loadFile('./source/postman.json', function(){
  var importedProject = pmImporter.import();
  try{
    //console.log(ramlConverter.getSLSchemas())
    fs.writeFileSync(__dirname + '/target/imported-postman.json', JSON.stringify(importedProject, null, 2), 'utf8');
  }
  catch(err) {
    console.log(err.stack);
  }
});
