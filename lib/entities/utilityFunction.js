function UtilityFunction(name) {
  this.name = name;
  this.description = '';
  this.script = '';
}

UtilityFunction.prototype = {
  get Name() {
    return this.name;
  },
  set Description(description) {
    this.description = description;
  },
  get Description() {
    return description;
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
    name: this.name,
    description: this.description,
    script: this.script
  };
};

module.exports = UtilityFunction;
