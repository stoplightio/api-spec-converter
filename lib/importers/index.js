var postman = require('./postman');
var raml08 = require('./raml08');
var raml10 = require('./raml10');
var swagger = require('./swagger');
var	stoplight = require('./stoplight');
var stoplightx = require('./stoplightx');
var auto = require('./auto');

var importers = {
  Postman: postman,
  RAML08: raml08,
  RAML10: raml10,
  Swagger: swagger,
  StopLight: stoplight,
  StopLightX: stoplightx,
  Auto: auto
};

function doesSupportFormat(format) {
  if(!format || !format.name || !importers.hasOwnProperty(format.className)) {
    return false;
  }
  return true;
}

module.exports = {
  hasSupport: doesSupportFormat,
  factory: function(format) {
    if (!doesSupportFormat(format)) {
      return null;
    }
    return new importers[format.className]();
  }
};
