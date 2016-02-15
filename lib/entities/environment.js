function Environment() {
  this.forwardHost = null;
  this.basePath = '';
  this.defaultResponseType = '';
  this.defaultRequestType = '';
  this.protocols = [];
  this.version = '';

  this.middlewareBefore = '';
  this.middlewareAfter = '';
  this.proxy = {};
  this.securitySchemes = {};
  this.resourcesOrder = {
    utilFuncs: [],
    docs: []
  };
}

Environment.prototype = {
  set Host(host) {
    this.forwardHost = host;
  },
  get Host() {
    return this.forwardHost;
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
  set Proxy(proxy) {
    this.proxy = proxy;
  },
  get Proxy() {
    if(this.proxy) {
      delete this.proxy['sslCert'];
      delete this.proxy['sslKey'];
    }
    return this.proxy;
  },
  set MiddlewareBefore(before) {
    this.middlewareBefore = before;
  },
  get MiddlewareBefore() {
    return this.middlewareBefore;
  },
  set MiddlewareAfter(after) {
    this.middlewareAfter = after;
  },
  get MiddlewareAfter() {
    return this.middlewareAfter;
  },
  set GroupsOrder(eo) {
    this.resourcesOrder = eo;
  },
  get GroupsOrder() {
    return this.resourcesOrder;
  },
  set SecuritySchemes(schemes) {
    this.securitySchemes = schemes;
  },
  get SecuritySchemes() {
    return this.securitySchemes;
  },
  addSecurityScheme: function(key, securityScheme) {
    this.securitySchemes[key] = securityScheme;
  },
  loadSLData: function(envData) {
    for(var key in envData) {
      if (this.hasOwnProperty(key)) {
        //direct map supported keys
        this[key] = envData[key];
      } else {
        //skip not supported properties
      }
    }
  }
};

//used for stoplightx export only
Environment.prototype.toJSON = function() {
  return {
    beforeScript: this.MiddlewareBefore,
    afterScript: this.MiddlewareAfter,
    groups: this.resourcesOrder
  };
};


module.exports = Environment;
