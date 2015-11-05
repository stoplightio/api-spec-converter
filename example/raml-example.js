var slConverter = require('../index')
var fs = require('fs')
var ramlConverter = new slConverter.Converter(slConverter.Formats.RAML, slConverter.Formats.RAML)

try {
  ramlConverter.loadFile('./source/example.raml', function(){
    try{
      //console.log(ramlConverter.getSLSchemas())
      fs.writeFileSync(__dirname + '/exported-raml.yaml', ramlConverter.getConvertedData('yaml'), 'utf8')
    }
    catch(err) {
      console.log(err.stack)
    }
  })
}
catch(err) {
  console.log("Error", err)
}


