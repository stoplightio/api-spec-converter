function Endpoint(name) {
  this.name = name
}

Endpoint.prototype = {
    get Path() {
      return this.path
    },
    set Path(path) {
      this.path = path
    },
    get Method() {
      return this.requestMethod
    },
    set Method(requestMethod) {
      this.requestMethod = requestMethod
    },
    get Name() {
      return this.name
    },
    get Headers() {
      return this.headers
    },
    set Headers(headers) {
      this.headers = headers
    },
    get QueryString() {
      return this.queryString
    },
    set QueryString(queryString) {
      this.queryString = queryString
    }
}


module.exports = Endpoint
