var exporters = {
  Swagger: require('./swagger'),
  StopLight: require('./stoplight'),
  StopLightX: require('./stoplightx'),
  RAML: require('./raml')
};

function hasFormatSupport(format) {
  if(!format || !format.name || !exporters.hasOwnProperty(format.className)) {
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
  }
};
