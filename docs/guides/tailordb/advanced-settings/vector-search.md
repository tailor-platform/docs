---
doc_type: guide
---

# Vector Search

Vector Search enables searching data using natural language queries.
We can enable the `Vector Field` for your fields properties, which will automatically calculate embeddings and generate vector query params.
Currently, Vector Search can only be enabled for `#TypeString` and cannot be used in conjunction with nested or array types.

```typescript
import { db } from "@tailor-platform/sdk";

export const product = db.table("Product", "Product model", {
  // ...
  description: db.string().description("Product description").vector(),
  ...db.fields.timestamps(),
});
export type product = typeof product;
```

We can use Vector Search specifying `vector: {<field name>: "natural language query"}`, which returns results in the order they match the query:

```graphql {{ title: 'query' }}
query VectorSearchProduct {
  products(vector: { description: "What products are associated with A and B?" })
}
```

It is useful to specify the `first` and to use a [query filter](/guides/tailordb/filters) to narrow down the results with Vector Search.

```graphql {{ title: 'query' }}
query VectorSearchProduct {
  products(
    first: 10
    query: { name: { contains: "XX" } }
    vector: { description: "What products are associated with A and B?" }
  )
}
```

## Function Service Support

Vector Search is also available in the Function service using SQL syntax. You can use the `vector_similarity` function to sort records by similarity. For more details, see [Accessing TailorDB from Function service](/guides/function/accessing-tailordb#vector-similarity-search).
