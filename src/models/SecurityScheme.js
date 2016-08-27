import Base from './Base'

export default class SecurityScheme extends Base {
  constructor() {
    // String
    this.type = null;

    // String
    this.displayName = null;

    // Parameter[]
    this.parameters = [];

    // Object
    this.settings = {
      /**
       * {
       *   scopes: Array[{ name: String, description: String }],
       *   flow: String,
       *   authorizationUrl: String,
       *   accessTokenUrl: String,
       * }
       */
    };

    this.extra = {};
  }
}
