import Base from './Base'

export default class SecurityRequirement extends Base {
  constructor() {
    // String
    this.name = null;

    // String[]
    this.scopes = [];

    this.extra = {};
  }
}
