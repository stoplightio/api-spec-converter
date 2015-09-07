var slConverter = require('../index')

var pmConverter = new slConverter.Converter('postman')

pmConverter.load(require('./postman.json'))

console.log('Groups:')
console.log(pmConverter.getSLEndpointGroups())

console.log('Endpoints:')
console.log(pmConverter.getSLEndpoints())
