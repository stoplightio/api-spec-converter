var _ = require('lodash');

module.exports = {

  getScalarTypes: ['string', 'number', 'integer', 'boolean', 'date', 'datetime', 'date-only', 'file', 'array', 'nilValue'],

  parameterMappings: {},

  getSupportedParameterFields: [
    'displayName', 'type', 'description', 'default', 'maximum',
    'minimum', 'maxLength', 'minLength', 'pattern', 'enum',
  ],

  setParameterFields: function(source, target) {
    for (var prop in source) {
			if (!source.hasOwnProperty(prop)) continue;
      if (this.getSupportedParameterFields.indexOf(prop) >= 0) {
        target[this.parameterMappings[prop] ? this.parameterMappings[prop] : prop] =
          typeof source[prop] === 'function' ? source[prop]() : source[prop];

        // call function if needed
        if (typeof target[prop] === 'function') {
          target[prop] = target[prop]();
        }

        // transform Text nodes
        if (typeof target[prop] !== 'string' && target[prop] && target[prop].value) {
          target[prop] = target[prop].value();
        } else if (prop === 'enum' && typeof target[prop] === 'string') { // enums must be arrays
          try {
            target[prop] = JSON.parse(target[prop].replace(/'/g, '"'));
          } catch (e) {
						//ignored
					}
        }
        if (!target[prop] || (_.isArray(target[prop]) && _.isEmpty(target[prop]))) {
					delete target[prop];
				}
      }
    }

    return target;
  },
};
