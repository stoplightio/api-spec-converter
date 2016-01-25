function Schema(namespace) {
  this.name = '';
  this.namespace = namespace;
  this.definition = '';
  this.example = '';
}

Schema.prototype = {
  get Id() {
    return this._id;
  },
  set Id(id) {
    this._id = id;
  },
  get Name() {
    return this.name;
  },
  set Name(name) {
    this.name = name;
  },
  get NameSpace() {
    return this.namespace;
  },
  set Definition(definition) {
    this.definition = definition;
  },
  get Definition() {
    return this.definition;
  },
  get Example() {
    return this.example;
  },
  set SLData(schemaData) {
    this.name = schemaData.name || '';
    this.definition = schemaData.definition || {};
    this.example = schemaData.example || {};
  }
};

Schema.prototype.toJSON = function() {
  return {
    name: this.Name,
    namespace: this.NameSpace,
    definition: this.definition,
    example: this.Example
  };
};

module.exports = Schema;
