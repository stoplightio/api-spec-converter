var slConverter = require('../index')
var fs = require('fs')
var ramlConverter = new slConverter.Converter('swagger')

try {
  ramlConverter.loadFile('./swagger.yaml')(function(){
    console.log('Endpoints:')
    var endpoints = ramlConverter.getSLEndpoints()
    console.log(endpoints)
  })
}
catch(err) {
  console.log("Error", err)
}
