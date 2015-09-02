var slConverter = require('../index')

var pmConverter = new slConverter.Converter('postman')

pmConverter.load(require('./postman.json'))

console.log(pmConverter.getSLEndpoints())
