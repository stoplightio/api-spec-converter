var fs = require('fs'),
    Importer = require('./importer'),
    Swagger = require('./swagger'),
    RAML = require('./raml'),
    Postman = require('./postman'),
    Stoplightx = require('./stoplightx'),
    Formats = require('../formats'),
    urlHelper = require('../utils/url');

// Detect input format automatically
function Auto() {
  this.importer = null;
  this.detectedFormat = null;
}
Auto.prototype = new Importer();

Auto.prototype.getDetectedFormat = function() {
  return this.detectedFormat;
};

Auto.prototype._trySwaggerAndRAML = function(specData, resolve, reject) {
  //try swagger and raml
  var me = this;
  var swagger = new Swagger();
  swagger.loadData(specData)
  .then(function(){
    //success
    me.detectedFormat = 'SWAGGER';
    me.data = swagger.data;
    me.importer = swagger;
    resolve();
  })
  .catch(function(err){
    //try RAML
    var raml = new RAML();
    raml.loadData(specData)
    .then(function(){
      me.detectedFormat = 'RAML';
      me.data = raml.data;
      me.importer = raml;
      resolve();
    })
    .catch(function(err){
      //console.log(err);
      err = 'No valid importer found for given input';
      reject(err);
    });
  });
};

Auto.prototype._tryStopLightAndPostman = function(specData, resolve, reject) {
  var me = this;
  //try stoplightx and postman
  var stoplightx = new Stoplightx();
  stoplightx.loadData(specData)
  .then(function(){
    //success
    me.detectedFormat = 'STOPLIGHTX';
    me.data = stoplightx.data;
    me.importer = stoplightx;
    resolve();
  })
  .catch(function(err){
    var postman = new Postman();
    postman.loadData(specData)
    .then(function(){
      me.detectedFormat = 'POSTMAN';
      me.data = postman.data;
      me.importer = postman;
      resolve();
    })
    .catch(function(err){
      //console.log(err);
      err = 'No valid importer found for given input';
      reject(err);
    });
  });
};

Auto.prototype.loadData = function(specData) {
  var me = this;
  return new Promise(function(resolve, reject){
    //Try to detect
    var type = 'json';
    try {
      var parsedJSON = JSON.parse(specData.trim());
    } catch(err) {
      type = 'yaml';
    }
    switch(type) {
      case 'yaml':
        return me._trySwaggerAndRAML(specData, resolve, reject);
        break;
      case 'json':
      case 'default':
        return me._tryStopLightAndPostman(specData, resolve, reject);
    }
  });
};

Auto.prototype.loadFile = function (filePath, cb) {
  var me = this;
  if(urlHelper.isURL(filePath)) {
    //url
    urlHelper.get(filePath)
    .then(function(body){
      me.loadData(body)
        .then(cb)
        .catch(cb);
    })
    .catch(cb);
  } else {
    //file
    var fileContent = fs.readFileSync(filePath, 'utf8');
    me.loadData(fileContent)
    .then(cb)
    .catch(cb);
  }
};

Auto.prototype._import = function() {
  this.importer._import();
  this.project = this.importer.project;
};

module.exports = Auto;
