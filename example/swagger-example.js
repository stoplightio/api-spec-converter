var slConverter = require('../index')
var fs = require('fs')

var ramlConverter = new slConverter.Converter(slConverter.Formats.RAML, slConverter.Formats.SWAGGER)

ramlConverter.loadFile(__dirname + '/example.raml')(function(){
  try{
    //ramlConverter.getConvertedData()
    fs.writeFileSync(__dirname + '/test.yaml', ramlConverter.getConvertedData('yaml'), 'utf8')
  }
  catch(err) {
    console.log(err.stack)
  }
})
