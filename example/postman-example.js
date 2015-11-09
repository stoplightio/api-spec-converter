var slConverter = require('../index')

var pmImporter = new slConverter.Importer.factory(slConverter.Formats.POSTMAN)

pmImporter.loadFile('./source/postman.json', function(){
  var importedProject = pmImporter.import()
  console.log('Groups:')
  console.log(importedProject.Groups)

  console.log('Endpoints:')
  console.log(importedProject.Endpoints)
})
