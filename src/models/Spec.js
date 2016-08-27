import Base from './Base'
import Info from './Info';

export default class Spec extends Base {
  constructor() {
    // Info
    this.info = new Info();

    // String
    this.host = null;

    // String
    this.basePath = null;

    // String[]
    this.protocols = [];

    // Tag[]
    this.tags = [];

    // SecurityScheme
    this.securitySchemes = [];

    // SecurityRequirement[]
    this.securedBy = [];

    // Resource[]
    this.resources = [];

    // Parameter[]
    this.parameters = [];

    this.extra = {};
  }
}
