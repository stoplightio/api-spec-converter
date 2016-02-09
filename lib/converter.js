var Importers = require('./importers/index'),
    Exporters = require('./exporters/index');

function Converter(fromFormat, toFormat) {
  this.importer = Importers.factory(fromFormat);
  if (!this.importer) {
    throw new Error('from format ' + fromFormat.name + ' not supported');
  }
  this.importer.type = fromFormat;

  this.exporter = Exporters.factory(toFormat);
  if (!this.exporter) {
    throw new Error('to format ' + toFormat.name + ' not supported');
  }
  this.exporter.type = toFormat;
}

Converter.prototype.loadFile = function (filePath, cb) {
  return this.importer.loadFile(filePath, cb);
};

Converter.prototype.loadData = function (rawData, cb) {
  return this.importer.loadData(rawData, cb);
};

Converter.prototype.convert = function (format) {
  this.exporter.loadProject(this.importer.import());
  return this.exporter.export(format);
};

exports.Converter = Converter;
