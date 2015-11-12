var Environment = require('./environment');

function Project(name) {
  this.name = name;
  this.description = '';
  this.groups = [];
  this.endpoints = [];
  this.schemas = [];
  this.securityDefinitions = [];
  this.utilityFunctions = [];
  this.environment = new Environment();
}

Project.prototype = {
  set Description(desc) {
    this.description = desc;
  },
  get Name() {
    return this.name;
  },
  get Description() {
    return this.description || '';
  },
  get Endpoints() {
    return this.endpoints;
  },
  set Endpoints(endpoints) {
    this.endpoints = endpoints;
  },
  get Groups() {
    return this.groups;
  },
  set Groups(groups) {
    this.groups = groups || [];
  },
  get Schemas() {
    return this.schemas;
  },
  set Schemas(schemas) {
    this.schemas = schemas;
  },
  get Environment() {
    return this.environment;
  },
  set Environment(env) {
    this.environment = env;
  },
  get UtilityFunctions() {
    return this.utilityFunctions;
  },
  addEndpoint:function(endpoint) {
    this.endpoints.push(endpoint);
  },
  addGroup:function(group) {
    this.groups.push(group);
  },
  addSchema: function(schema) {
    this.schemas.push(schema);
  },
  addUtilityFunction: function(uf) {
    this.utilityFunctions.push(uf);
  }
};

Project.prototype.toJSON = function() {
  return {
    name: this.Name,
    description: this.Description,
    environment: this.Environment.toJSON(),
    groups: this.groups.map(function(item){ return item.toJSON();}),
    endpoints: this.endpoints.map(function(item){ return item.toJSON();}),
    schemas: this.schemas.map(function(item){ return item.toJSON();}),
    securityDefinitions: this.securityDefinitions.map(function(item){ return item.toJSON();}),
    utilityFunctions: this.utilityFunctions.map(function(item){ return item.toJSON();})
  };
};

module.exports = Project;
