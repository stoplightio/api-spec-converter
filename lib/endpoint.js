function Endpoint(name) {
  this.name = name
  this.request = {}
}

Endpoint.prototype = {
    get Path() {
      return this.request.path
    },
    set Path(path) {
      this.request.path = path
    },
    get Method() {
      return this.request.method
    },
    set Method(requestMethod) {
      this.request.method = requestMethod
    },
    get Name() {
      return this.name
    },
    get Headers() {
      return this.request.headers
    },
    set Headers(headers) {
      this.request.headers = JSON.stringify(headers)
    },
    get QueryString() {
      return this.request.queryString
    },
    set QueryString(queryString) {
      this.request.queryString = JSON.stringify(queryString)
    },
    get Before() {
      return this.middlewareBefore
    },
    set Before(before) {
      this.middlewareBefore = before
    },
    set Body(body) {
      this.request.bodies = []
      this.request.bodies.push(body)
    },
    get Body {
      return this.request.bodies
    }
}


module.exports = Endpoint
