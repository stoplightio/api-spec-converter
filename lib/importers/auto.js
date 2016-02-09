var fs = require('fs'),
    Importer = require('./importer'),
    Swagger = require('./swagger'),
    RAML = require('./raml'),
    Postman = require('./postman'),
    Stoplightx = require('./stoplightx'),
    Formats = require('../formats'),
    request = require('request');

// Detect input format automatically
function Auto() {
  this.importer = null;
}
Auto.prototype = new Importer();

Auto.prototype.loadData = function(specData, cb) {
  //Try to detect
  var type = 'json';
  try {
    var parsedJSON = JSON.parse(specData.trim());
  } catch(err) {
    type = 'yaml';
  }

  var me = this;
  switch(type) {
    case 'yaml':
      //try swagger and raml
      var swagger = new Swagger();
      swagger.loadData(specData, function(err){
        if (err) {
          //try RAML
          var raml = new RAML();
          raml.loadData(specData, function(err){
            if (err) {
              var err = new Error('No valid importer found for this file');
              cb(err);
            } else {
              me.data = raml.data;
              me.importer = raml;
              cb();
            }

          });
        } else {
          //success
          me.data = swagger.data;
          me.importer = swagger;
          cb();
        }
      });
      break;
    case 'json':
    case 'default':
      //try swagger, stoplightx and postman
      var stoplightx = new Stoplightx();
      stoplightx.loadData(specData, function(err){
        if (err) {
          var postman = new Postman();
          postman.loadData(specData, function(err){
            if (err) {
              cb(err);
            } else {
              me.data = postman.data;
              me.importer = postman;
              cb();
            }
          });
        } else {
          //success
          me.data = stoplightx.data;
          me.importer = stoplightx;
          cb();
        }
      });
  }
};

Auto.prototype.loadFile = function (filePath, cb) {
  var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%_\+.~#?&\/\/=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)?/gi;
  var regexp = new RegExp(expression);
  var me = this;
  if(filePath.match(regexp)) {
    //url
    request(filePath, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        return me.loadData(response.body, cb);
      } else {
        return cb(new Error('invalid url path given'));
      }
    });
  } else {
    //file
    var fileContent = fs.readFileSync(filePath, 'utf8');
    return me.loadData(fileContent, cb);
  }
};

Auto.prototype._import = function() {
  this.importer._import();
  this.project = this.importer.project;
};

module.exports = Auto;
