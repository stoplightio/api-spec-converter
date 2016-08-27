import Base from './Base'
import Operation from './Operation'

export default class Resource extends Base {
  constructor() {
    // String
    this.path = null;

    // String
    this.displayName = null;

    // String
    this.summary = null;

    // String
    this.description = null;

    // Object[]
    this.tags = [];

    // Object[]
    this.traits = [];

    // SecurityRequirement[]
    this.securedBy = [];

    // Resource[]
    this.resources = [];

    // Operation[]
    this.operations = [];

    // Parameter[]
    this.parameters = [];

    this.extra = {};
  }
}
