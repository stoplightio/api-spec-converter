var fs = require('fs'),
    Importer = require('./importer'),
    Swagger = require('./swagger'),
    RAML = require('./raml'),
    Postman = require('./postman'),
    Stoplightx = require('./stoplightx'),
    Formats = require('../formats');

// Detect input format automatically
function Auto() {
  this.importer = null;
}
Auto.prototype = new Importer();


Auto.prototype.loadFile = function (filePath, cb) {
  //Try to detect
  var ext = filePath.split('.').pop();
  var me = this;
  switch(ext) {
    case 'yaml':
      //try swagger and raml
      var swagger = new Swagger();
      swagger.loadFile(filePath, function(err){
        if (err) {
          //try RAML
          var raml = new RAML();
          raml.loadFile(filePath, function(err){
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
      //try swagger, stoplightx and postman
      var stoplightx = new Stoplightx();
      stoplightx.loadFile(filePath, function(err){
        if (err) {
          var postman = new Postman();
          postman.loadFile(filePath, function(err){
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
      break;
    default:
      var err = new Error('File for this extension isn\'t supported');
      cb(err);
  }
};

Auto.prototype._import = function() {
  this.importer._import();
  this.project = this.importer.project;
};

module.exports = Auto;
