var _ = require('lodash');

module.exports = {
  computeOperationId: function(m, p) {
    var method = _.trim(m).toUpperCase();
    var path = _.trim(p);

    if (path === '/' || path === '') {
      return `${method}_root`;
    }
    return `${method}_${_.trim(path, '/').replace(/\{|\}/g, '').replace(/\/|\./g, '-')}`;
  },
  computeTraitName: function(name, key) {
    var traitName = `trait:${_.camelCase(name)}`;

    if (key) {
      traitName += `:${key}`;
    }

    return traitName;
  },
};
