var Environment = require('./environment');

function Project(name) {
  this.name = name;
  this.description = '';
  this.groups = [];
  this.endpoints = [];
  this.schemas = [];
  this.environment = new Environment();

  this.securitySchemes = {};
  this.utilityFunctions = [];
  this.endpointsOrder = [];
}

Project.prototype = {
  set Description(desc) {
    this.description = desc || '';
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
  set SecuritySchemes(schemes) {
    this.securitySchemes = schemes;
  },
  get SecuritySchemes() {
    return this.securitySchemes;
  },
  set EndpointsOrder(eo) {
    this.endpointsOrder = eo;
  },
  get EndpointsOrder() {
    return this.endpointsOrder;
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
  },
  addSecurityScheme: function(key, securityScheme) {
    this.securitySchemes[key] = securityScheme;
  },
  loadSLData: function(slData) {
    this.Description = slData.description;
    this.securitySchemes = slData.securitySchemes;
  }
};

Project.prototype.toJSON = function() {
  return {
    name: this.Name,
    description: this.Description,
    environment: this.Environment.toJSON(),
    groups: this.groups.map(function(item){
      return item.toJSON();
    }),
    endpoints: this.endpoints.map(function(item){
      return item.toJSON();
    }),
    schemas: this.schemas.map(function(item){
      return item.toJSON();
    }),
    securitySchemes: this.securitySchemes,
    utilityFunctions: this.utilityFunctions.map(function(item){
      return item.toJSON();
    }),
    endpointsOrder: this.endpointsOrder
  };
};

module.exports = Project;
