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
      for(var j in headers) {
        var header = headers[j]
        if(!header) {
          continue
        }
        var keyValueParts = header.split(':')
        headerObj[keyValueParts[0]] = keyValueParts[1]
      }
      endpoint.Headers = headerObj

      var data = {body: {type: 'object', properties: {}}}
      //TODO map Body
      switch (pmr.dataMode) {
        case 'urlencoded':
          data.mimeType = 'application/x-www-form-urlencoded'
        case 'params':
          //check for best suitability
          data.mimeType = 'multipart/form-data'
          break
        default:
          data.mimeType = 'text/plain'
          break
      }

      for(var j in pmr.data) {
        data.body.properties[pmr.data[j].key] = {
          'type': pmr.data[j].type,
          'default': pmr.data[j].value
        }
      }

      endpoint.Body = data
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
