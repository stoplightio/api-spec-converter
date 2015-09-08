var slConverter = require('../index')

var ramlConverter = new slConverter.Converter('raml')

ramlConverter.load('./example.raml', function(){
  //console.log('Groups:')
  //console.log(ramlConverter.getSLEndpointGroups())

  console.log('Endpoints:')
  try {
    var endpoints = ramlConverter.getSLEndpoints()
    for (var index in endpoints) {
      if (endpoints[index].request.bodies) {
        console.log(endpoints[index].request.bodies[0])
      }
    }
  }
  catch(err) {
    console.log(err)
  }
})
