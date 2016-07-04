module.exports = {
  parameterMappings: {},

  getSupportedParameterFields: [
    'displayName', 'type', 'description', 'default', 'maximum',
    'minimum', 'maxLength', 'minLength', 'pattern', 'enum'
  ],

  setParameterFields: function(source, target) {
    for(var prop in source) {
      if (this.getSupportedParameterFields.indexOf(prop) >= 0) {
        if (this.parameterMappings[prop]) {
          target[this.parameterMappings[prop]] = source[prop];
        } else {
          target[prop] = source[prop];
        }

        // enums must be arrays
        if (prop === 'enum' && typeof target[prop] === 'string') {
          try {
            target[prop] = JSON.parse(target[prop].replace(/\'/g, '\"'));
          } catch (e) {}
        }
      }
    }

    return target;
  }
};
