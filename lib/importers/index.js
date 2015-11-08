var importers = {
  Postman: require('./postman'),
  RAML: require('./raml'),
  Swagger: require('./swagger'),
  StopLight: require('./stoplight')
}

module.exports = {
  hasSupport: function(format) {
    if(!format || !format.name || !importers.hasOwnProperty(format.className)) {
      return false
    }
    return true
  },
  factory: function(format) {
    if (!this.hasSupport(format)) {
      return null
    }
    return new importers[format.className]()
  }
}
