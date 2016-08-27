import Base from './Base'
import Request from './Request'
import Response from './Response'

export default class Operation extends Base {
  constructor() {
    // String
    this.method = null;

    // String
    this.name = null;

    // String
    this.summary = null;

    // String
    this.description = null;

    // Tag[]
    this.tags = [];

    // String[]
    this.protocols = [];

    // Parameter[]
    this.parameters = [];

    // Response[]
    this.responses = [];

    // Object[]
    this.traits = [];

    // SecurityRequirement[]
    this.securedBy = [];

    this.extra = {};
  }
}
