function Environment() {
  this.forwardHost = 'localhost'
  this.basePath = ''
}

Environment.prototype = {
  set Host(host) {
    this.forwardHost = host
  },
  get Host() {
    return this.forwardHost || 'localhost'
  },
  set BasePath(basePath) {
    this.basePath = basePath
  },
  get BasePath() {
    return this.basePath || ''
  }
}

module.exports = Environment
