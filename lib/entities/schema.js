function Schema(name) {
  this.name = name
  this.definition = {}
  this.example = {}
}

Schema.prototype = {
  get Name() {
    return this.name
  },
  set Definition(definition) {
    this.definition = JSON.stringify(definition)
  },
  get Definition() {
    return JSON.parse(this.definition)
  },
  set Example(example) {
    this.example = example
  },
  get Example() {
    return this.example
  }
}

module.exports = Schema
