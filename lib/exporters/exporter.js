var YAML = require('js-yaml'),
    Importer = require('../importers/index');

function Exporter() {
  this.data = null;
  this.project = null;
}
Exporter.prototype = {
  get Data(){
    //var stringData = JSON.stringify(this.data);
    //stringData = stringData.replace('’','\'');
    //return JSON.parse(stringData);
    return this.data;
  }
};

Exporter.prototype.loadSLData = function (rawData) {
  var importer = Importer.factory({
    name: 'StopLight',
    className: 'StopLight'
  });
  importer.loadData(rawData);
  this.project = importer.import();
};

Exporter.prototype.loadProject = function (project) {
  this.project = project;
};

Exporter.prototype._export = function () {
  throw new Error('_export method not implemented');
};

Exporter.prototype.export = function (format) {
  this._export();
  return this._getData(format);
};

Exporter.prototype._getData = function(format) {
  switch (format) {
    case 'yaml':
      return YAML.safeDump(JSON.parse(JSON.stringify(this.Data)));
    default:
      return this.Data;
  }
};

Exporter.prototype._mapEndpoint = function () {
  throw new Error('_mapEndpoint method not implemented');
};

Exporter.prototype._mapSchema = function () {
  throw new Error('_mapSchema method not implemented');
};
Exporter.prototype._mapQueryString = function () {
  throw new Error('_mapQueryString method not implemented');
};
Exporter.prototype._mapURIParams = function () {
  throw new Error('_mapURIParams method not implemented');
};
Exporter.prototype._mapRequestBody = function () {
  throw new Error('_mapRequestBody method not implemented');
};
Exporter.prototype._mapResponseBody = function () {
  throw new Error('_mapResponseBody method not implemented');
};
Exporter.prototype._mapRequestHeaders = function () {
  throw new Error('_mapRequestHeaders method not implemented');
};

module.exports = Exporter;
