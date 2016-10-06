const Importers = require('./importers/index');
const Exporters = require('./exporters/index');

const _ = require('lodash');

function Converter(fromFormat, toFormat) {
  this.importer = Importers.factory(fromFormat);
  if (!this.importer) {
    throw new Error(`from format ${fromFormat.name} not supported`);
  }
  this.importer.type = fromFormat;

  this.exporter = Exporters.factory(toFormat);
  if (!this.exporter) {
    throw new Error(`to format ${toFormat.name} not supported`);
  }
  this.exporter.type = toFormat;
}

function loadFile(filePath, cb) {
  return this.importer.loadFile(filePath, cb);
}
Converter.prototype.loadFile = loadFile;

// todo unify api by returning a Promise like the loadData function

function loadFileWithOptions(filePath, options, cb) {
  return this.importer.loadFileWithOptions(filePath, options, cb);
}
Converter.prototype.loadFileWithOptions = loadFileWithOptions;

function loadData(rawData, options) {
  const me = this;
  return new Promise(promise);
	function promise(resolve, reject) {
		me.importer.loadData(rawData, options)
			.then(resolve)
			.catch(reject);
	}
}
Converter.prototype.loadData = loadData;

function convert(format, cb) {
	var me = this;
	return new Promise(function (resolve, reject) {
		try {
			me.exporter.loadProject(me.importer.import());
			me.exporter.export(format)
				.then(function (exportedData) {
					if (cb) cb(null, exportedData);
					resolve(exportedData);
				})
				.catch(function (err) {
					if (cb)cb(err, null);
					reject(err);
				});
		} catch (e) {
			reject(e);
		}
	});
}
Converter.prototype.convert = convert;

exports.Converter = Converter;
