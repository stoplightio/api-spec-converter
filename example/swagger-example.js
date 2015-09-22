var slConverter = require('../index')
var fs = require('fs')

var ramlConverter = new slConverter.Converter(slConverter.Formats.SWAGGER, slConverter.Formats.SWAGGER)

try {
  ramlConverter.loadFile(__dirname + '/swagger.yaml')(function(){
    console.log(JSON.stringify(ramlConverter.getConvertedData(), null, 2))
  })
}
catch(err) {
  console.log("Error", err)
}
