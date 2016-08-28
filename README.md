# How to build

```
npm i
npm run build // will build both node and web
```

```
npm run validate // will validate code style against eslint rules
```

# Initial Requirements

- Work in the browser and node >= 4, with reasonable performance characteristics.
- Support single file import, multi-file import, url import, object import.
- Support RAML 0.8, RAML 1.0, Swagger 2, and Postman (import only).

# Models

Find the draft data model in the src/models folder.

All models inherit common functionality from the Base model class.

Top level model / point of entry is the Spec model.

```
spec
    info{}
    baseUri
    protocols[]
    securitySchemes[]
    securedBy[]
    resources[]
    parameters[]
    extra{}
```

Every model must have an "extra" property. Importers should use this object to put extensions, annotations, or properties that don't otherwise fit into the specification and/or data model.

# Parameters

A super model, able to handle describing:

- path
- query
- headers
- bodies
- traits

Parameters can be recursive. For example, a trait parameter can itself have an array of parameters, to describe the trait's headers, query, etc.

# Optimizers

Propose building optimizers into each exporter, that can optionally be turned on.

The purpose of these optimizers would be to example the data model during export, and identify areas of improvement for use in the final exported artifact. These improvements would be tied directly to the capabilities of the spec being exported to.

The goal of optimizers is to help the end user produce specifications that takes full advantage of of the specific specification's more advanced features, like traits for RAML, common responses for Swagger, etc.

For example, if the operations in the data model share a common set of responses (as is often the case for error codes), extract those out to a trait in the case of RAML, or root level responses in the case of Swagger.
