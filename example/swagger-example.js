var slConverter = require('../index')
var fs = require('fs')

var ramlConverter = new slConverter.Converter(slConverter.Formats.SWAGGER, slConverter.Formats.STOPLIGHT)

try {
  ramlConverter.loadFile('./swagger.yaml')(function(){
    console.log(ramlConverter.getConvertedData())
  })
}
catch(err) {
  console.log("Error", err)
}
