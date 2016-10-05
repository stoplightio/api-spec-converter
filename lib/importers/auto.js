var fs = require('fs');
var _ = require('lodash');
var Importer = require('./importer');
var Swagger = require('./swagger');
var RAML08 = require('./raml08');
var RAML10 = require('./raml10');
var Postman = require('./postman');
var StopLightX = require('./stoplightx');
var urlHelper = require('../utils/url');

// Detect input format automatically
function Auto() {
  this.importer = null;
  this.detectedFormat = null;
}

Auto.prototype = new Importer();

Auto.prototype.getDetectedFormat = function() {
  return this.detectedFormat;
};

Auto.prototype._parseStopLightX = function(data, resolve, reject) {
  var self = this;
	var stopLightX = new StopLightX();

  stopLightX.loadData(data)
    .then(() => {
      self.detectedFormat = 'STOPLIGHTX';
      self.data = stopLightX.data;
      self.importer = stopLightX;

      resolve();
    })
    .catch(reject);
};

Auto.prototype._parsePostman = function(data, resolve, reject) {
  var self = this;
	var postman = new Postman();

  postman.loadData(data)
    .then(() => {
      self.detectedFormat = 'POSTMAN';
      self.data = postman.data;
      self.importer = postman;

      resolve();
    })
    .catch(reject);
};

Auto.prototype._parseRAML = function(data, resolve, reject) {
  var self = this;
  var raml;
  var detectedFormat;
  if (/#%RAML[\s]*0\.?8?/.test(data)) {
    raml = new RAML08();
    detectedFormat = RAML08.name;
  } else if (/#%RAML[\s]*1\.?0?/.test(data)) {
    raml = new RAML10();
    detectedFormat = RAML10.name;
  }

  raml.loadData(data)
    .then(() => {
      self.detectedFormat = detectedFormat;
      self.data = raml.data;
      self.importer = raml;

      resolve();
    })
    .catch(reject);
};

Auto.prototype._parseSwagger = function(data, resolve, reject) {
  var self = this;
	var swagger = new Swagger();

  swagger.loadData(data)
    .then(() => {
      self.detectedFormat = 'SWAGGER';
      self.data = swagger.data;
      self.importer = swagger;

      resolve();
    })
    .catch(reject);
};

Auto.prototype.detectFormat = function(data) {
	var parsedData;
	var type;
	if (!data) {
		return;
	}
	parsedData = _.trim(data);

  try {
    parsedData = JSON.parse(data);
    type = 'json';
  } catch (err) {
    parsedData = data;
    type = 'yaml';
  }

  if (type === 'json') {
    if (parsedData.swagger) {
      return 'STOPLIGHTX';
    }
		return 'POSTMAN';
  }

  if (type === 'yaml') {
    if (/#%RAML[\s]*0\.?8?/.test(parsedData)) {
      return RAML08.name;
    } else if (/#%RAML[\s]*1\.?0?/.test(parsedData)) {
      return RAML10.name;
    }

    if (/swagger:[\s'"]*\d\.?\d?/.test(parsedData)) {
      return 'SWAGGER';
    }
  }

  return 'UNKNOWN';
};

Auto.prototype.loadData = function(data) {
  var self = this;
	var format = this.detectFormat(data);

  return new Promise((resolve, reject) => {
    switch (format) {
      case 'STOPLIGHTX':
        return self._parseStopLightX(data, resolve, reject);
      case 'POSTMAN':
        return self._parsePostman(data, resolve, reject);
      case 'RAML08':
      case 'RAML10':
        return self._parseRAML(data, resolve, reject);
      case 'SWAGGER':
        return self._parseSwagger(data, resolve, reject);
      case 'UNKNOWN':
        return reject(new Error('Unable to parse file. Invalid or unsupported syntax.'));
      default:
        return reject(new Error('No data provided'));
    }
  });
};

Auto.prototype.loadFile = function(filePath, cb) {
  var self = this;
	var fileContent;

  if (urlHelper.isURL(filePath)) {
    // Remote file
    urlHelper.get(filePath)
      .then(body => self.loadData(body)
				.then(cb)
				.catch(cb))
      .catch(cb);
  } else {
    // Local file
    fileContent = fs.readFileSync(filePath, 'utf8');

    self.loadData(fileContent)
      .then(cb)
      .catch(cb);
  }
};

Auto.prototype._import = function() {
  this.importer._import();
  this.project = this.importer.project;
};

module.exports = Auto;
