function Environment() {
  this.forwardHost = 'localhost';
  this.basePath = '';
  this.defaultResponseType = '';
  this.defaultRequestType = '';
  this.protocols = [];
  this.version = '';

  this.middlewareBefore = '';
  this.middlewareAfter = '';
  this.proxy = {};
}

Environment.prototype = {
  set Host(host) {
    this.forwardHost = host;
  },
  get Host() {
    return this.forwardHost || 'http://localhost:3000';
  },
  set BasePath(basePath) {
    this.basePath = basePath;
  },
  get BasePath() {
    return this.basePath || '';
  },
  get DefaultResponseType() {
    return this.defaultResponseType;
  },
  set DefaultResponseType(respType) {
    this.defaultResponseType = respType;
  },
  get DefaultRequestType() {
    return this.defaultRequestType;
  },
  set DefaultRequestType(reqType) {
    this.defaultRequestType = reqType;
  },
  get Protocols() {
    return this.protocols;
  },
  set Protocols(protocols) {
    this.protocols = protocols;
  },
  get Version() {
    return this.version || '';
  },
  set Version(version) {
    this.version = version;
  },
  get Proxy() {
    if(this.proxy) {
      delete this.proxy['sslCert'];
      delete this.proxy['sslKey'];
    }
    return this.proxy;
  }
};

Environment.prototype.loadSLData = function(envData) {
  for (var key in envData) {
   this[key] = envData[key];
  }
};

Environment.prototype.toJSON = function() {
  return {
    forwardHost: this.forwardHost,
    basePath: this.basePath,
    defaultResponseType: this.defaultResponseType,
    defaultRequestType: this.DefaultRequestType,
    protocols: this.protocols,
    version: this.version,
    middlewareBefore: this.middlewareBefore,
    middlewareAfter: this.middlewareAfter,
    proxy: this.Proxy
  };
};


module.exports = Environment;
