
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

IMapper.prototype.getData = function() {
  return this.data
}

IMapper.prototype.getEndpoints = function() {
  return this.endpoints
}

IMapper.prototype.setEndpoints = function (endpoints) {
  this.endpoints = endpoints
}

IMapper.prototype.getEndpointGroups = function() {
  return this.groups
}

IMapper.prototype.setEndpointGroups = function (endpointGroups) {
  this.endpointGroups = endpointGroups
}

IMapper.prototype.mapFrom = function() {
  throw new Error('method not implemented')
}

module.exports = IMapper
