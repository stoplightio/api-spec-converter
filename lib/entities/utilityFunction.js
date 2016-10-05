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
    return this.description;
  },
  set Script(script) {
    this.script = script;
  },
  get Script() {
    return this.script;
  },
};

// used for stoplightx export only
UtilityFunction.prototype.toJSON = function() {
  return {
    name: this.Name,
    description: this.Description,
    script: this.Script,
  };
};

module.exports = UtilityFunction;
