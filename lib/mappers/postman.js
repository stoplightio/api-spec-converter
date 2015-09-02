var Endpoint = require('../endpoint')

function Postman() {
  this.data = null

  this.endpoints = []
}

Postman.prototype.loadData = function(jsonData) {
  this.data = jsonData
}

Postman.prototype.map = function() {
  for(var i = 0; i < this.data.requests.length; i++) {
      pmr = this.data.requests[i]
      var endpoint, headers, headerObj = {}
      endpoint = new Endpoint(pmr.name)
      endpoint.Path = pmr.url
      endpoint.Method = pmr.method
      endpoint.QueryString = pmr.pathVariables
      endpoint.Before = pmr.preRequestScript

      //parse headers
      headers = pmr.headers.split('\n')
      for(var i in headers) {
        var header = headers[i]
        var keyValueParts = header.split(':')
        headerObj[keyValueParts[0]] = keyValueParts[1]
      }

      endpoint.Headers = JSON.stringify(headerObj)

      this.endpoints.push(endpoint)
  }
}

Postman.prototype.getRawData = function() {
  return this.data
}

Postman.prototype.getEndpoints = function() {
  return this.endpoints
}

module.exports = Postman
