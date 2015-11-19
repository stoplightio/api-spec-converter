function Endpoint(name) {
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
    set ItemId(id) {
      this.itemId = id;
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
      return this.name;
    },
    get Headers() {
      return JSON.parse(this.request.headers);
    },
    set Headers(headers) {
      this.request.headers = JSON.stringify(headers);
    },
    get Before() {
      return this.middlewareBefore;
    },
    set Before(before) {
      this.middlewareBefore = before;
    },
    set Body(body) {
      body.body = JSON.stringify(body.body);
      this.request.bodies.push(body);
    },
    get Body() {
      if (this.request.bodies.length > 0) {
        return this.request.bodies[0];
      }
      return [];
    },
    set QueryString(queryString) {
      queryString = JSON.stringify(queryString);
      this.request.queryString = queryString;
    },
    get QueryString() {
      if (!this.request.queryString) {
        this.request.queryString = '{}';
      }
      return JSON.parse(this.request.queryString);
    },
    set PathParams(uriParams) {
      //uriParams = JSON.stringify(uriParams)
      this.request.pathParams = uriParams;
    },
    get PathParams() {
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
    }
};

Endpoint.prototype.toJSON = function() {
  return {
    name: this.name,
    description: this.description,
    summary: this.summary,
    request: this.request,
    responses: this.responses,
    middlewareBefore: this.middlewareBefore,
    middlewareAfter: this.middlewareAfter,
    mock: this.mock,
    securedBy: this.securedBy
  };
};


module.exports = Endpoint;
