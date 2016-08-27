# Overview

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

# Models

Base class is Model. All other models inherit common functionality from this class.

Top level model / point of entry is the Spec model.

Every model has an "extra" property. Importers should use this object to put extensions, annotations, or properties that don't otherwise fit into the specification and/or data model.

# Parameters

A super model, able to handle describing:

- path
- query
- headers
- bodies
- traits

Parameters can be recursive. A trait parameter can itself have an array of parameters, to describe the trait's headers, query, etc.
