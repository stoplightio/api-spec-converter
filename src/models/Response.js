export default class Response extends Base {
  constructor() {
    // String[]
    this.codes = [];

    // String
    this.summary = null;

    // String
    this.description = null;

    // Parameter[]
    this.parameters = [];

    this.extra = {};
  }
}
