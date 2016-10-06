const _ = require('lodash');

function computeOperationId(m, p) {
  const method = _.trim(m).toUpperCase();
  const path = _.trim(p);
  if (path === '/' || path === '') {
    return `${method}_root`;
  }
  return `${method}_${_.trim(path, '/').replace(/\{|\}/g, '').replace(/\/|\./g, '-')}`;
}

function computeTraitName(name, key) {
  let traitName = `trait:${_.camelCase(name)}`;
  if (key) {
    traitName += `:${key}`;
  }
  return traitName;
}

module.exports = {
  computeOperationId: computeOperationId,
  computeTraitName: computeTraitName,
};
