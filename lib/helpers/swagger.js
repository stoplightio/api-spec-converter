module.exports = {
  getSupportedParameterFields: function() {
    return ['type', 'description', 'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum',
            'maxLength', 'minLength', 'pattern', 'enum', 'multipleOf', 'items', 'format'];
  },
  setParameterFields: function(from, to) {
    var supportedParams = this.getSupportedParameterFields();
    for(var prop in from) {
      if (supportedParams.indexOf(prop) >= 0) {
        to[prop] = from[prop];
      }
    }
    return to;
  }
};
