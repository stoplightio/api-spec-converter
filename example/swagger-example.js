var slConverter = require('../index')
var fs = require('fs')

var ramlConverter = new slConverter.Converter(slConverter.Formats.SWAGGER, slConverter.Formats.SWAGGER)

ramlConverter.loadFile(__dirname + '/swagger.yaml')(function(){
  try{
    //ramlConverter.getConvertedData()
    fs.writeFileSync(__dirname + '/test.json', JSON.stringify(ramlConverter.getConvertedData(), null, 2), 'utf8')
  }
  catch(err) {
    console.log(err)
  }
})
