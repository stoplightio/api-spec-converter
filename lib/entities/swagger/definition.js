
function SwaggerDefinition(title, description) {
  this.swagger = '2.0';
  this.schemes = [];
  this.basePath = '';
  this.host = '';
  this.info = {
    'version': '',
    'title': title,
    'description': description
  };
  this.paths = {};

  this.definitions = {};
}

SwaggerDefinition.prototype = {
  set BasePath(basePath) {
    if (basePath && basePath.length > 0) {
      this.basePath = basePath;
    } else {
      delete this.basePath;
    }
  },
  set Host(host) {
    if (host && host.length > 0) {
      this.host = host;
    } else {
      delete this.host;
    }
  }
};

module.exports = SwaggerDefinition;
