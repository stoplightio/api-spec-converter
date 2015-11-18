var YAML = require('json2yaml'),
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
      return YAML.stringify(this.Data);
    default:
      return this.Data;
  }
};

module.exports = Exporter;
