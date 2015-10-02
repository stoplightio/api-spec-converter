var slConverter = require('../index')

var pmConverter = new slConverter.Converter(slConverter.Formats.POSTMAN, slConverter.Formats.STOPLIGHT)

pmConverter.loadFile('./postman.json')

console.log('Groups:')
console.log(pmConverter.getImportedProject().Groups)

console.log('Endpoints:')
console.log(pmConverter.getImportedProject().Endpoints)
