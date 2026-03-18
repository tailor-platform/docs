---
doc_type: guide
---

# Advanced Settings

Enabling extra features in `settings` field allows you to generate additional GraphQL queries.
These features include:

- [Aggregating values](aggregation)
- [Bulk upsert](bulk-upsert)
- [Plural form for uncountable nouns](uncountable-nouns)
- [Tailor DB Change Data Capture(CDC)](tailordb-cdc) - Publish record events for database triggers

Below is a table listing all the available `settings`, with each field and its corresponding type.

| Field Name | Type |
|------------|------|
| Aggregation | `bool` |
| BulkUpsert | `bool` |
| Draft | `bool` |
| DefaultQueryLimitSize | `int`: Default number of records returned by a query is 100. |
| MaxBulkUpsertSize | `int`: Maximum number of records that can be processed in a single bulk upsert operation is limited to 1,000. |
| PluralForm | `bool` |
| PublishRecordEvents | `bool` |

Also, we can utilize the following advanced GraphQL schema configuration to optimize GraphQL queries.

- Directives
- Extends

## Directives

Directive is a GraphQL concept, that provides a way to add additional instructions to GraphQL queries without having to modify the schema.
This allows developers to use GraphQL to access the same data in different ways without having to change the underlying data structure.
The `Directives` field holds a map structure data, where the key is directive name and the value is a map of arguments defined in the `Args` key.

For example, we can define the directive of `@key(fields: "id")` as the following:

```typescript
import { db } from "@tailor-platform/sdk";

export const myType = db
  .type("MyType", "My type with directives", {
    // ...fields
  })
  .directives([
    {
      name: "key",
      args: [{ name: "fields", value: "id" }],
    },
  ]);
```

```sh
  // enable directives
  directives = [
    {
      name = "key"
      args = [
        {
          name  = "fields"
          value = "id"
        }
      ]
    }
  ]
```

See [GraphQL Directives](https://graphql.org/learn/queries/#directives) for more details.

## Extends

The `Extends` option enables the extension of the types defined in other sub-graphs, like StateFlow.
With this option enabled, CRUD GraphQL queries become available in Tailor DB.
To make this work, the directive of `@key(fields: "id")` must be defined.

For example, if we want to extend State resource in StateFlow, we can define the `extend` and directives in the schema as follows:
This will generate `createExtendState`, `updateExtendState`, `deleteExtendState`, and `changeExtendState` API.

```typescript
import { db } from "@tailor-platform/sdk";

// Example of extending State type
export const state = db
  .type("State", "State type with extends", {
    // ...fields
  })
  .extends(true)
  .directives([
    {
      name: "key",
      args: [{ name: "fields", value: "id" }],
    },
  ]);
```

```sh
  // example of state.tf enabling extends
  resource "tailor_tailordb_type" "state" {
    workspace_id = tailor_workspace.ims.id
    namespace    = tailor_tailordb.ims.namespace
    name         = "State"

    // Set true for extends setting
    extends = true

    // You must define @key(fields: "id") directive as follows
    directives = [{
      name = "key"
      args = [
        {
          name  = "fields"
          value = "id"
        }
      ]
    }]
  }
```
