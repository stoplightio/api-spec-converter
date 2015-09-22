function Endpoint(name) {
  this.name = name
  this.request = {}
  this.responses = []
}

Endpoint.prototype = {
    set ItemId(id) {
      this.itemId = id
    },

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
      this.request.method = requestMethod.toLowerCase()
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
      body.body = JSON.stringify(body.body)
      this.request.bodies = []
      this.request.bodies.push(body)
    },
    get Body() {
      if (this.request.bodies.length > 0) {
        //this.request.bodies[0].body = JSON.parse(this.request.bodies[0].body)
        //console.log(this.request.bodies[0].body)
        return this.request.bodies[0]
      }
      return []
    },
    set QueryString(queryString) {
      queryString = JSON.stringify(queryString)
      this.request.queryString = queryString
    },
    get QueryString() {
      return JSON.parse(this.request.queryString)
    },
    set PathParams(uriParams) {
      uriParams = JSON.stringify(uriParams)
      this.request.pathParams = uriParams
    },
    get PathParams() {
      return JSON.parse(this.request.pathParams)
    },
    set Responses(res) {
      this.responses = res
    },
    get Responses() {
      return this.responses
    }
}


module.exports = Endpoint
