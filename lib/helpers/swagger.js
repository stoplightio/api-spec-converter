module.exports = {
  getSupportedParameterFields: function() {
    return ['type', 'description', 'default', 'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum',
            'maxLength', 'minLength', 'pattern', 'maxItems', 'minItems', 'uniqueItems', 'enum', 'multipleOf', 'items', 'format'];
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
