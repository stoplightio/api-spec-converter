function UtilityFunction(name) {
  this.name = name;
  this.description = '';
  this.script = '';
}

UtilityFunction.prototype = {
  get Id() {
    return this._id;
  },
  set Id(id) {
    this._id = id;
  },
  get Name() {
    return this.name;
  },
  set Description(description) {
    this.description = description;
  },
  get Description() {
    return this.description;
  },
  set Script(script) {
    this.script = script;
  },
  get Script() {
    return this.script;
  }
};

UtilityFunction.prototype.toJSON = function() {
  return {
    name: this.Name,
    description: this.Description,
    script: this.Script
  };
};

module.exports = UtilityFunction;
