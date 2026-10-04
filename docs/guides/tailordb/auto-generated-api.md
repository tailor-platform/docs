---
description: "The queries and mutations generated for every table: fetch by ID or unique field, list with filters and sorting, create, update, delete and conditional update."
doc_type: guide
---

# Auto-generated APIs

Based on the name of the schema, GraphQL APIs are automatically generated.
Each query has fields defined in the schema. See [fields](/guides/tailordb/fields) section for details.
The following generated queries and mutations are available for use:

## Queries

- `<type_name>`: return a single resource based on the provided resource ID.
- `<type_name>By`: return a single resource based on the unique field value.\
  To enable this query, you need to set `unique` and `index` as `true` in the field settings. See [Supporting fields](/guides/tailordb/fields#uniqueindex) for more details.
- `<type_name>s`: return multiple resources based on a search query (_query_), pagination parameters, and a sorting parameter (_order_).
- `<type_name>Permission`: return permissions set in the resource based on the provided resource ID.

### Pagination

We support cursor pagination by default in TailorDB. This approach enables for more efficient data retrieval, especially for large datasets.\
Cursor pagination uses cursors like `after` and `first` to fetch data relative to a specific point.

```graphql
type Query {
  users(
    query: UserQueryInput
    order: UserOrderInput
    first: Int
    after: String
    last: Int
    before: String
  ): UserConnection!
}
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  total: Int
}
type UserEdge {
  node: User!
  cursor: String!
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

**The string input for `after` or `before` needs to be a base64-encoded representation of the cursor.**

The number of records retrieved is determined by the `first` or `last` parameter:

- If neither `first` nor `last` is specified, `first` defaults to `DefaultQueryLimitSize` (default: 100).
- If both `first` and `last` are specified, an error is returned.
- If `first` or `last` is less than 0 or greater than 1000, an error is returned.

The retrieval order of records is determined by the `order` parameter:

- If no `order` is specified, the records will be retrieved in the order they were created, using `_created` (an internal field) and `id` to generate the cursor.
- If an `order` is specified, the cursor is created using the specified field and `id`.

#### Example Query

```graphql {{ title: "query"}}
query users {
  users(
    first: 3
    # Without specifying after, retrieve the first 3 records
    order: [{ field: name, direction: Asc }]
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        name
      }
    }
  }
}
```

```json {{ title: "response"}}
{
  "data": {
    "users": {
      "pageInfo": {
        "hasNextPage": true,
        "endCursor": "W3siZm...In1d"
      },
      "edges": [
        {
          "node": {
            "name": "user1"
          }
        },
        {
          "node": {
            "name": "user2"
          }
        },
        {
          "node": {
            "name": "user3"
          }
        }
      ]
    }
  }
}
```

```graphql {{ title: "query"}}
query users {
  users(
    first: 3
    # Specifying the endCursor from the previous response to retrieve the next 3 records.
    after: "W3siZm...In1d"
    order: [{ field: name, direction: Asc }]
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        name
      }
    }
  }
}
```

```json {{ title: "response"}}
{
  "data": {
    "users": {
      "pageInfo": {
        // Since hasNextPage is false, there is no point in retrieving more records.
        "hasNextPage": false,
        "endCursor": "W3siZm...In1d"
      },
      "edges": [
        {
          "node": {
            "name": "user4"
          }
        },
        {
          "node": {
            "name": "user5"
          }
        }
      ]
    }
  }
}
```

### Sorting

You can use the `order: [QueryNameOrderInput]` argument to sort the results of the query.
The argument accepts an array of QueryNameOrderInput values, each of which will be evaluated in the order specified in the array.

| Argument  | Description                         |
| --------- | ----------------------------------- |
| direction | Desc or Asc                         |
| field     | Field name as the enumeration value |

### Filtering

Refer to [Filters](/guides/tailordb/filters) guide.

## Mutations

### Create, Update and Delete

- `create<type_name>`: create the resource based on the values provided for each field.
- `update<type_name>`: update the resource based on the provided resource ID and the values provided for each field.
- `delete<type_name>`: delete the resource based on the provided resource ID.

### Conditional Update

The Conditional Update feature is available in all automatically generated update mutations, allowing atomic updates that occur only when specified conditions are met. This ensures data consistency by preventing updates when conditions are not satisfied.

When performing an update, you can specify a condition query alongside the update data. The update executes only if the condition matches the current record state; otherwise, an error is returned. The condition query follows the same format as filter queries in list operations.

To use conditional updates, include a condition parameter in your update mutation, using the same filter format as query parameters in list operations. For example, to update an Episode title to "Return of the Jedi" only if its current title is "A New Hope":

```graphql
mutation {
  updateEpisode(
    id: "b666346f-0b2d-42f7-bcba-b18f46ee573d"
    input: { title: "Return of the Jedi" }
    condition: { title: { eq: "A New Hope" } }
  ) {
    id
    title
  }
}
```

You can use all filter operators including logical operators like `and`, `or`, and `not`. For more details on filters, see [Filters](/guides/tailordb/filters).

### Change Permission

- `change<type_name>`: change the permission of the resource based on the provided resource ID and `PermissionItemInput` values for read, update, and delete actions.
  `PermissionItemInput` has a `PermitEnum` field that can be either `allow` or `deny`. **Note:** This mutation is part of the deprecated Legacy Permission system. Consider using the [new Permission system](/guides/tailordb/permission) for new applications.

# Example

As the example, if you specify this `Report` schema, the following queries and mutations API will be automatically generated based on the schema.

Besides basic CRUD operations, [Aggregation](/guides/tailordb/advanced-settings/aggregation), [Bulk upsert](/guides/tailordb/advanced-settings/bulk-upsert) and more available as [Advanced APIs](/guides/tailordb/advanced-settings/overview).
