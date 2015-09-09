var slConverter = require('../index')
var fs = require('fs')
var ramlConverter = new slConverter.Converter('raml')

try {
  var data = fs.readFileSync('./example.raml', 'utf8')
  ramlConverter.load(data)(function(){
    console.log('Endpoints:')
    var endpoints = ramlConverter.getSLEndpoints()
    for (var index in endpoints) {
      if (endpoints[index].request.headers) {
        console.log(endpoints[index].request.headers)
      }
    }
  })
}
catch(err) {
  console.log("Error", err)
}


