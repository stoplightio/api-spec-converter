
function Importer() {
  this.data = null;
  this.endpoints = [];
  this.groups = [];
  this.schemas = [];

  this.project = null;
  this.mapped = false;
}

Importer.prototype = {
  get Mapped() {
    return this.mapped;
  },
  get IsDataLoaded() {
    return (this.data !== null);
  }
};

Importer.prototype.loadFile = function (path) {
  throw new Error('loadFIle method not implemented');
};

Importer.prototype.loadData = function (data) {
  this.data = data;
};

Importer.prototype._import = function () {
  throw new Error('_import method not implemented');
};

Importer.prototype.import = function () {
  if(!this.IsDataLoaded) {
    throw new Error('data not loaded for ' + (this.constructor.name.toString()));
  }

  if (!this.Mapped) {
    this._import();
    this.mapped = true;
  }
  return this.project;
};

module.exports = Importer;
