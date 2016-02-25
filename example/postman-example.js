var slConverter = require('../index'),
    fs = require('fs');

var pmImporter = new slConverter.Importer.factory(slConverter.Formats.POSTMAN);

pmImporter.loadFile('./source/postman_corrupt.json', function(err){
  if (err) {
    return console.log(err);
  }
  var importedProject = pmImporter.import();
  try{
    fs.writeFileSync(__dirname + '/target/imported-postman.json', JSON.stringify(importedProject, null, 4), 'utf8');
  }
  catch(err) {
    console.log(err.stack);
  }
});
