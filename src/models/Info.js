import Base from './Base'

export default class Info extends Base {
  constructor() {
    // String
    this.title = null;

    // String
    this.version = null;

    // String
    this.description = null;

    // Object
    this.termsOfService = null;

    // Object
    this.contact = null;

    // Object
    this.license = null;

    // Object
    this.externalDocs = null;

    this.extra = {};
  }
}
