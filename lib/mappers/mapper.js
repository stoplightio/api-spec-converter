
function IMapper() {
  this.data = null
  this.endpoints = []
  this.groups = []
}

IMapper.prototype.loadFile = function (path) {
  throw new Error('method not implemented')
}

IMapper.prototype.map = function () {
  throw new Error('method not implemented')
}

IMapper.prototype.getRawData = function() {
  return this.data
}

IMapper.prototype.getEndpoints = function() {
  return this.endpoints
}

IMapper.prototype.getEndpointGroups = function() {
  return this.groups
}

module.exports = IMapper
