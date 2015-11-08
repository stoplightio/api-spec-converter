var slConverter = require('../index')

var pmConverter = new slConverter.Converter(slConverter.Formats.POSTMAN, slConverter.Formats.STOPLIGHT)

pmConverter.loadFile('./source/postman.json', function(){
  console.log('Groups:')
  console.log(pmConverter.getImportedProject().Groups)

  console.log('Endpoints:')
  console.log(pmConverter.getImportedProject().Endpoints)
})
