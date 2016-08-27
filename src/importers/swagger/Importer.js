import SwaggerImporter2 from './2.0/Importer'

export default class SwaggerImporter {
  constructor(version = '2.0') {
    const versions = {
      '2.0': SwaggerImporter2
    };

    if (!versions[version]) {
      throw new Error(`Version ${version} is not supported by Swagger importer.`)
    }

    return new versions[version]()
  }
}
