import SwaggerExporter2 from './2.0/Exporter'

export default class SwaggerExporter {
  constructor(version = '2.0') {
    const versions = {
      '2.0': SwaggerExporter2
    };

    if (!versions[version]) {
      throw new Error(`Version ${version} is not supported by Swagger exporter.`)
    }

    return new versions[version]()
  }
}
