function Schema(namespace) {
  this.name = '';
  this.namespace = namespace;
  this.definition = {};
  this.example = {};
}

Schema.prototype = {
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
    this.definition = JSON.stringify(definition);
  },
  get Definition() {
    return JSON.parse(this.definition);
  },
  set Example(example) {
    this.example = example;
  },
  get Example() {
    return this.example;
  }
};

Schema.prototype.toJSON = function() {
  return {
    name: this.name,
    namespace: this.namespace,
    definition: this.definition,
    example: this.example
  };
};

module.exports = Schema;
