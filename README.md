# API Spec Converter [![Build Status](https://travis-ci.org/stoplightio/api-spec-converter.svg)](https://travis-ci.org/stoplightio/api-spec-converter) [![Coverage Status](https://coveralls.io/repos/stoplightio/api-spec-converter/badge.svg?branch=master&service=github)](https://coveralls.io/github/stoplightio/api-spec-converter?branch=master)

This package helps to convert between different API specifications (Postman, Swagger, RAML, StopLight).

###Converter Usage
```
var slConverter = require('api-spec-converter'), //Warning: not published to npm yet
    fs = require('fs')
ramlToSwaggerConverter = new slConverter.Converter(slConverter.Formats.RAML, slConverter.Formats.SWAGGER)
ramlToSwaggerConverter.loadFile('/source/raml.yaml', function(){
  try{
    fs.writeFileSync('/target/raml.yaml', ramlToSwaggerConverter.convert('yaml'), 'utf8');
  }
  catch(err) {
    console.log(err.stack);
  }
});
```
###Development
Install dependencies:
```
$npm install
```

Run tests:
```
npm test
```

Run eslint to check linting errors:
```
gulp lint

