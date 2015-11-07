function Environment() {
  this.forwardHost = 'localhost'
  this.basePath = ''
  this.defaultResponseType = ''
  this.defaultRequestType = ''
  this.protocols = []
}

Environment.prototype = {
  set Host(host) {
    this.forwardHost = host
  },
  get Host() {
    return this.forwardHost || 'http://localhost:3000'
  },
  set BasePath(basePath) {
    this.basePath = basePath
  },
  get BasePath() {
    return this.basePath || ''
  },
  get DefaultResponseType() {
    return this.defaultResponseType
  },
  set DefaultResponseType(respType) {
    this.defaultResponseType = respType
  },
  get DefaultRequestType() {
    return this.defaultRequestType
  },
  set DefaultRequestType(reqType) {
    this.defaultRequestType = reqType
  },
  get Protocols() {
    return this.protocols
  },
  set Protocols(protocols) {
    this.protocols = protocols
  }
}

Environment.prototype.loadSLData = function(envData) {
  for (var key in envData) {
   this[key] = envData[key]
  }
}

module.exports = Environment
