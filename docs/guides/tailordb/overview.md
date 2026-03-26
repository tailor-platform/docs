---
doc_type: guide
---

# TailorDB

TailorDB is the primary database service within Tailor Platform, where you store and retrieve your data.
TailorDB provides a flexible and scalable database that you build using schema definitions.
A GraphQL endpoint is automatically generated, enabling seamless fetching, creation, updating, and deletion of records.
Additionally, it allows for easy sorting and filtering by any field.

## Defining a Schema

A data model of your application is defined by the schema. The Tailor Platform SDK provides a type-safe TypeScript API for defining your data models.

### Project Structure

Below is a typical folder structure for a Tailor Platform project using the SDK:

```
my-app/
├── tailor.config.ts      # Configuration file
├── tailordb/
│   ├── index.ts          # Exports all types
│   ├── product.ts        # Product type definition
│   └── category.ts       # Category type definition
├── auth/
│   └── index.ts          # Auth configuration
└── pipeline/
    └── index.ts          # Pipeline resolvers
```

### Defining a Type

Here's how to define a `Product` type using the SDK:

```typescript
import { db } from "@tailor-platform/sdk";

export const product = db.type("Product", "Product data schema", {
  title: db.string().description("Title of the product").index(),
  description: db.string().description("Description of the product"),
  price: db.float(),
  ...db.fields.timestamps(),
});
export type product = typeof product;
```

The SDK provides:

- **Type-safe field definitions** with TypeScript autocomplete
- **Fluent API** for field modifiers (`.index()`, `.unique()`, `.description()`)
- **Built-in field helpers** like `db.fields.timestamps()` for common patterns

```typescript
import { db } from "@tailor-platform/sdk";

export const product = db
  .type("Product", "Product data schema", {
    title: db.string().description("Title of the product").index(),
    description: db.string().description("Description of the product"),
  })
  .permission({ read: [[{ user: "_loggedIn" }, "=", true]] });
```

## Field Types

The SDK supports the following field types:

| Method          | TailorDB Type | TypeScript Type |
| --------------- | ------------- | --------------- |
| `db.string()`   | String        | string          |
| `db.int()`      | Integer       | number          |
| `db.float()`    | Float         | number          |
| `db.bool()`     | Boolean       | boolean         |
| `db.date()`     | Date          | string          |
| `db.datetime()` | DateTime      | string          |
| `db.time()`     | Time          | string          |
| `db.uuid()`     | UUID          | string          |
| `db.enum()`     | Enum          | string          |
| `db.object()`   | Nested        | object          |

### Optional and Array Fields

```typescript
db.string({ optional: true });
db.string({ array: true });
db.string({ optional: true, array: true });
```

### Enum Fields

```typescript
db.enum(["red", "green", "blue"]);
db.enum([
  { value: "active", description: "Active status" },
  { value: "inactive", description: "Inactive status" },
]);
```

### Object Fields (Nested)

```typescript
db.object({
  street: db.string(),
  city: db.string(),
  country: db.string(),
});
```

## Auto-generated GraphQL API

In TailorDB, the GraphQL APIs are [automatically generated](/guides/tailordb/auto-generated-api) based on your schema definitions.

## Schema Composition

### Basic Structure

A TailorDB type definition consists of:

- **Type name** (Required): The name of the data model
- **Description** (Optional): Description shown in GraphQL SDL and playground
- **Fields** (Required): Field definitions with types and modifiers

```typescript
export const task = db.type("Task", "Task management entity", {
  title: db.string().description("Task title"),
  completed: db.bool(),
  dueDate: db.datetime({ optional: true }),
  ...db.fields.timestamps(),
});
export type task = typeof task;
```

See [Fields](fields) for detailed field configuration options.

### Permissions

TailorDB follows a **secure-by-default** principle. All operations are denied unless explicitly granted.

```typescript
db.type("Task", {
  title: db.string(),
  ownerId: db.uuid(),
  ...db.fields.timestamps(),
}).permission({
  create: [[{ user: "role" }, "=", "admin"]],
  read: [
    [{ user: "role" }, "=", "admin"],
    [{ record: "ownerId" }, "=", { user: "id" }],
  ],
  update: [[{ record: "ownerId" }, "=", { user: "id" }]],
  delete: [[{ user: "role" }, "=", "admin"]],
});
```

See [Permission](permission) for more information.

## Advanced Features

### Type Features

Enable additional GraphQL operations with the `.features()` modifier:

```typescript
db.type("Product", {
  name: db.string(),
  price: db.float(),
  ...db.fields.timestamps(),
}).features({
  aggregation: true, // Enable aggregate queries
  bulkUpsert: true, // Enable bulk upsert mutations
});
```

See [Advanced Settings](advanced-settings/overview) for more information.

### Composite Indexes

Create multi-field indexes for query optimization:

```typescript
db.type("Order", {
  customerId: db.uuid(),
  orderDate: db.datetime(),
  ...db.fields.timestamps(),
}).indexes({
  fields: ["customerId", "orderDate"],
  name: "customer_order_idx",
});
```

See [Indexes](indexes) for more information.

## Next Steps

- [Fields](fields) - Detailed field type configuration
- [Relationships](relationships) - Define relations between types
- [Hooks](hooks) - Add custom logic on create/update
- [Validations](validations) - Field-level data validation
- [Permission](permission) - Access control configuration
