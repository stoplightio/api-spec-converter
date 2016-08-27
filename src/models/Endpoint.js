import Model from './Model'
import Request from './Request'
import Response from './Response'

export default class Endpoint extends Model {
  constructor() {
    this.name = null;
    this.description = null;
    this.url = null;
    this.params = [
      {
        type: 'param',
        in: 'q',
      }
    ]



    this.tags = [];
    this.queries = [];
    this.requests = [
      new Request()
    ];
    this.responses = [
      new Response()
    ];
  }
}
