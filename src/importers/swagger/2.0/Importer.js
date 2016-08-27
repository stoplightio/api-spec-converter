import Importer from '../Importer'

// I'm using word "extract" because we actually extracting entities from spec
// data instead of creating them from scratch

export default class SwaggerImporter extends Importer {
  parse(source, options = {}) {
    // here we are parsing incoming data string with help of swagger-parser
  }

  _extractSpecification() {
    // Spec will contain general data of a spec: basePath, info etc.
  }

  _extractModels() {
    // Swagger global definitions
  }

  _extractSecurityDefinitions() {

  }

  _extractEndpoints() {
    // There is no chance to merge all features of all supported specs equally
    // so we should dereference all data into an endpoint: add basePath, add
    // host, add schemes, add global consumes etc
  }

  _extractEndpoint() {

  }

  _extractRequest() {

  }

  _extractResponse() {

  }

  _extractRequestBodies() {

  }

  _extractResponseBodies() {

  }

  _extractQueries() {

  }

  _extractHeaders() {

  }

  _extractPathParams() {

  }
}
