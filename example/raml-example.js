var slConverter = require('../index')
var fs = require('fs')
var ramlConverter = new slConverter.Converter(slConverter.Formats.RAML, slConverter.Formats.STOPLIGHT)

try {
  ramlConverter.loadFile('./example.raml')(function(){
    console.log('Endpoints:')
    var project = ramlConverter.getImportedProject()
    var endpoints = project.Endpoints
    for (var index in endpoints) {
      if (endpoints[index].responses) {
        console.log(endpoints[index].responses)
      }
    }
  })
}
catch(err) {
  console.log("Error", err)
}


