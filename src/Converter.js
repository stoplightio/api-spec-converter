import SwaggerImporter from './importers/swagger/Importer';
import SwaggerExporter from './exporters/swagger/Exporter';

export default class Converter {
  constructor() {
    this.importers = {
      swagger: SwaggerImporter,
    };

    this.exporters = {
      swagger: SwaggerExporter,
    };
  }

  convert(source, options = {}) {
    const {importer: importerOpts, exporter: exporterOpts} = options;
    const data = this._getData(source);
    const importer = this._initImporter(importerOpts);
    const exporter = this._initExporter(exporterOpts);

    const importPromise = this._getPromise(importer.parse(data, importerOpts.options));

    return importPromise.then(context => {
      const exportPromise = this._getPromise(exporter.serialize(context, exporterOpts.options));
    }).catch(err => {
      console.error('caught error', err, err.stack);
    });
  }

  _getPromise(obj) {
    if (!(obj instanceof Promise)) {
      return new Promise(resolve => resolve(obj));
    }

    return obj;
  }

  _initImporter(options = {}) {
    const {type, version} = options;

    if (!this.importers[type]) {
      throw new Error(`Importer ${type} is not supported.`);
    }

    return new this.importers[type](version);
  }

  _initExporter(options = {}) {
    const {type, version} = options;

    if (!this.exporters[type]) {
      throw new Error(`Exporter ${type} is not supported.`);
    }

    return new this.exporters[type](version);
  }

  _getData(source) {

  }
}
