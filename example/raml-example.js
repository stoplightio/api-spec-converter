var slConverter = require('../index')
var fs = require('fs')
var ramlConverter = new slConverter.Converter('raml')

try{
  var data = fs.readFileSync('./example.raml', 'utf8')
  ramlConverter.load(data, function(){
    console.log('Endpoints:')
    try {
      var endpoints = ramlConverter.getSLEndpoints()
      for (var index in endpoints) {
        if (endpoints[index].request.bodies) {
          console.log(endpoints[index].request.queryString)
        }
      }
    }
    catch(err) {
      console.log(err)
    }
  })
}
catch(err) {
  console.log(err)
}
