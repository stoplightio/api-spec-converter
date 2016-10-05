var swagger = require('./swagger');
var stoplightx = require('./stoplightx');
var raml08 = require('./raml08');
var raml10 = require('./raml10');

var exporters = {
  Swagger: swagger,
  StopLightX: stoplightx,
  RAML08: raml08,
  RAML10: raml10,
};

function hasFormatSupport(format) {
  if (!format || !format.name || !exporters.hasOwnProperty(format.className)) {
    return false;
  }
  return true;
}


module.exports = {
  hasSupport: hasFormatSupport,
  factory: function(format) {
    if (!hasFormatSupport(format)) {
      return null;
    }
    return new exporters[format.className]();
  },
};
