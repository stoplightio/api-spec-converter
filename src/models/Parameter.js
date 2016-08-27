import Base from './Base'

export default class Parameter extends Base {
  constructor() {
    // String
    this.name = null;

    // String
    this.displayName = null;

    // String
    this.usage = null;

    // String
    this.summary = null;

    // String
    this.description = null;

    // String[]
    // path, query, requestHeader, responseHeader, requestBody, responseBody, definition, trait
    this.for = [];

    // String[]
    this.types = [];

    // String
    // possible usage includes mimeType to qualify a response body parameter
    this.qualifier = null;

    // Any
    this.definition = null;

    // Any
    this.default = null;

    // Boolean
    this.required = null;

    // Object[]
    this.examples = [];

    // String[]
    this.enum = [];

    // Parameter[]
    this.parameters = [];

    this.extra = {};
  }
}
