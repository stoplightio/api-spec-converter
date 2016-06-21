var jsonHelper = require('../utils/json');

function Test(name) {
  this.name = name;
  this.summary = '';
  this.initialVariables = '{}';
  this.steps = [];
}

Test.prototype = {
  get Name() {
    return this.name;
  },
  get Summary() {
    return this.summary || '';
  },
  set Summary(summary) {
    this.summary = summary;
  },
  get InitialVariables() {
    return this.initialVariables;
  },
  set InitialVariables(initialVariables) {
    this.initialVariables = jsonHelper.stringify(initialVariables, 4);
  },
  get Steps() {
    return this.steps;
  },
  set Steps(step) {
    this.steps = step;
  },
};

module.exports = Test;
