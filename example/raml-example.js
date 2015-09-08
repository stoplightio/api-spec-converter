var slConverter = require('../index')

var ramlConverter = new slConverter.Converter('raml')

ramlConverter.load('./example.raml', function(){
  //console.log('Groups:')
  //console.log(ramlConverter.getSLEndpointGroups())

  console.log('Endpoints:')
  console.log(ramlConverter.getSLEndpoints())
})
