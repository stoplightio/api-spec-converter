# API Spec Converter [![Build Status](https://travis-ci.org/stoplightio/api-spec-converter.svg)](https://travis-ci.org/stoplightio/api-spec-converter) [![Coverage Status](https://coveralls.io/repos/stoplightio/api-spec-converter/badge.svg?branch=master&service=github)](https://coveralls.io/github/stoplightio/api-spec-converter?branch=master)

This package helps to convert between different API specifications (Postman, Swagger, RAML, StopLight).

###Installation
We didn't released any official npm package just yet. But that doesn't stop you from start using it at all.
Use this command to install the latest revision:

```
npm install https://github.com/stoplightio/api-spec-converter.gi
```
Or, just put the following in your package.json file's dependecies list:
```
{
    "dependencies": {
        "api-spec-converter": "git+https://github.com/stoplightio/api-spec-converter.git"
    }
}
```


###Converter Usage

```
var slConverter = require('api-spec-converter'), //Warning: not published to npm yet
    fs = require('fs')
ramlToSwaggerConverter = new slConverter.Converter(slConverter.Formats.RAML, slConverter.Formats.SWAGGER)
ramlToSwaggerConverter.loadFile('/source/raml.yaml', function(err){
  if (err) {
    console.log(err.stack);
    return;
  }

  ramlToSwaggerConverter.convert('yaml')
  .then(function(convertedData){
    fs.writeFileSync('/target/raml.yaml', convertedData, 'utf8');
  })
  .catch(function(err){
    console.log(err);
  })
});
```
Not that `loadFile` method supports both a local file path and a remote url as well.

You can tell the converter to detect the input format automatically as well(by passing `AUTO` format), it will detect the right format for the input:

```
var myConverter = new slConverter.Converter(slConverter.Formats.AUTO, slConverter.Formats.SWAGGER);
```

You can also load string data instead of a file path:

```
myConverter.loadData(myData)
.then(function(){
    //do the convert
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

