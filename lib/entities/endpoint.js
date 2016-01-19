var jsonHelper = require('../utils/json');

function Endpoint(name) {
  this._id = null;
  this.name = name;
  this.description = '';
  this.summary = '';
  this.request = {};
  this.request.bodies = [];
  this.request.headers = '{}';
  this.responses = [];

  this.middlewareBefore = '';
  this.middlewareAfter = '';
  this.mock = {};
  this.securedBy = {
    none : true
  };

}

Endpoint.prototype = {
    get Id() {
      return this._id;
    },
    set Id(id) {
      this._id = id;
    },
    get Path() {
      return this.request.path;
    },
    set Path(path) {
      this.request.path = path;
    },
    get Method() {
      return this.request.method;
    },
    set Method(requestMethod) {
      this.request.method = requestMethod.toLowerCase();
    },
    get Name() {
      return this.name || '';
    },
    get Headers() {
      return jsonHelper.parse(this.request.headers);
    },
    set Headers(headers) {
      this.request.headers = jsonHelper.stringify(headers, 4);
    },
    get Before() {
      return this.middlewareBefore;
    },
    set Before(before) {
      this.middlewareBefore = before;
    },
    get After() {
      return this.middlewareAfter;
    },
    set After(after) {
      this.middlewareAfter = after;
    },
    set Body(body) {
      body.body = jsonHelper.stringify(body.body, 4);
      this.request.bodies.push(body);
    },
    get Body() {
      if (this.request.bodies.length > 0) {
        return this.request.bodies[0];
      }
      return [];
    },
    set QueryString(queryString) {
      queryString = jsonHelper.stringify(queryString, 4);
      this.request.queryString = queryString;
    },
    get QueryString() {
      if (!this.request.queryString) {
        this.request.queryString = '{}';
      }
      return jsonHelper.parse(this.request.queryString);
    },
    set PathParams(uriParams) {
      //uriParams = JSON.stringify(uriParams, null, 4)
      this.request.pathParams = {};//uriParams;
    },
    get PathParams() {
      //disabling path param support as not supported by stoplight
      //and cause validation error on raml import
      //TODO URI/Path Param isn't supported by stoplight just yet
      this.request.pathParams = {};//uriParams;
      return this.request.pathParams;
    },
    set Responses(res) {
      this.responses = res;
    },
    get Responses() {
      return this.responses;
    },

    set SLData(data) {
      for(var key in data) {
        this[key] = data[key];
      }
    },

    set Description(desc) {
      this.description = desc;
    },
    get Description() {
      return this.description || '';
    },

    set Summary(summary) {
      if (summary.length > 120) {
        this.summary = summary.substring(0, 119);
      }
      else {
        this.summary = summary;
      }
    },

    get Summary() {
      return this.summary || '';
    },

    set SecuredBy(security) {
      this.securedBy = security;
    },
    get SecuredBy() {
      return this.securedBy;
    },
    get Mock() {
      return this.mock;
    },
    get Request() {
      return this.request;
    }
};

Endpoint.prototype.toJSON = function() {
  return {
    _id: this._id,
    name: this.Name,
    description: this.Description,
    summary: this.Summary,
    request: this.request,
    responses: this.Responses,
    middlewareBefore: this.Before,
    middlewareAfter: this.After,
    mock: this.Mock,
    securedBy: this.SecuredBy
  };
};


module.exports = Endpoint;
