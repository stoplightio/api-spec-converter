var exporters = {
  Swagger: require('./swagger'),
  StopLight: require('./stoplight'),
  RAML: require('./raml'),
}

module.exports = {
  hasSupport: function(format) {
    if(!format || !format.name || !exporters.hasOwnProperty(format.className)) {
      return false
    }
    return true
  },
  factory: function(format) {
    if (!this.hasSupport(format)) {
      return null
    }
    return new exporters[format.className]()
  }
}
