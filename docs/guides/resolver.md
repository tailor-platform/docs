---
doc_type: guide
---

# Resolver

The Tailor Platform provides GraphQL APIs to access and manipulate your data.
While the auto-generated GraphQL APIs cover many use cases, more complex ones require custom business logic.
Pipeline provides custom resolvers that can chain queries and perform data transformations.

## Quick Start with SDK

The SDK provides a simplified way to create custom GraphQL resolvers using TypeScript:

```typescript
import { createResolver, t } from "@tailor-platform/sdk";
import { getDB } from "../generated/tailordb";

export default createResolver({
  name: "incrementUserAge",
  operation: "mutation",
  input: {
    email: t.string(),
  },
  body: async (context) => {
    const db = getDB("tailordb");
    const user = await db
      .selectFrom("User")
      .selectAll()
      .where("email", "=", context.input.email)
      .executeTakeFirstOrThrow();

    await db
      .updateTable("User")
      .set({ age: user.age + 1 })
      .where("id", "=", user.id)
      .execute();

    return { oldAge: user.age, newAge: user.age + 1 };
  },
  output: t.object({
    oldAge: t.int(),
    newAge: t.int(),
  }),
});
```

### Key Features

- **Type-safe input/output schemas** using `t` object
- **Direct database access** via Kysely query builder
- **User context** for authentication/authorization
- **Input validation** with custom rules

### Input Validation

```typescript
createResolver({
  input: {
    email: t
      .string()
      .validate(
        ({ value }) => value.includes("@"),
        [({ value }) => value.length <= 255, "Email must be 255 characters or less"],
      ),
  },
  // ...
});
```

## Overview

When a request resolves to a pipeline, it goes through its steps sequentially.
As it proceeds through those, the results of each step are passed as arguments to the next.
Each step can use the results of its caller using `args`, or use the results of any prior step using `context`.

## Definition

The SDK resolver definition specifies the resolver's behavior, input/output types, and implementation.

**Properties**

| Property    | Type     | Required | Description                                  |
| ----------- | -------- | -------- | -------------------------------------------- |
| `name`      | string   | Yes      | The name of the resolver                     |
| `operation` | string   | Yes      | Either `"query"` or `"mutation"`             |
| `input`     | object   | No       | Input schema using `t` type builders         |
| `body`      | function | Yes      | Async function containing the resolver logic |
| `output`    | object   | Yes      | Output schema using `t` type builders        |

**Example**

```typescript
import { createResolver, t } from "@tailor-platform/sdk";

export default createResolver({
  name: "myResolver",
  operation: "mutation",
  input: {
    userId: t.uuid(),
    name: t.string(),
  },
  body: async (context) => {
    return { success: true };
  },
  output: t.object({
    success: t.boolean(),
  }),
});
```

### Caveats

- `Subscription` operations are not supported, only `Mutation` and `Query` may be used.
- The name of the types **MUST NOT** collide with the existing types' (e.g. `User`, etc.) as well as auto-generated operations (e.g. `createUser`, etc.).

## Resolver

The SDK `createResolver` function defines a complete resolver with its input, output, and implementation logic.

**Properties**

| Property    | Type     | Required | Description                                            |
| ----------- | -------- | -------- | ------------------------------------------------------ |
| `name`      | string   | Yes      | The resolver name (used in GraphQL schema)             |
| `operation` | string   | Yes      | `"query"` or `"mutation"`                              |
| `input`     | object   | No       | Input schema defined with `t` type builders            |
| `body`      | function | Yes      | Async function with resolver logic, receives `context` |
| `output`    | object   | Yes      | Output schema defined with `t` type builders           |

**Context Properties**

The `body` function receives a `context` object with:

| Property        | Description                                     |
| --------------- | ----------------------------------------------- |
| `context.input` | The validated input arguments                   |
| `context.user`  | Current user information (id, attributes, etc.) |

**Example**

```typescript
import { createResolver, t } from "@tailor-platform/sdk";
import { getDB } from "../generated/tailordb";

export default createResolver({
  name: "bindUserToContract",
  operation: "mutation",
  input: {
    userID: t.uuid(),
    contractID: t.uuid(),
    bindDate: t.date(),
    employeeType: t.enum(["MANAGER", "STAFF"]),
  },
  body: async (context) => {
    const db = getDB("tailordb");

    // Perform database operations
    await db
      .updateTable("Contract")
      .set({ userId: context.input.userID })
      .where("id", "=", context.input.contractID)
      .execute();

    return { userID: context.input.userID };
  },
  output: t.object({
    userID: t.uuid(),
  }),
});
```

### Schema types

Scalar Types

- String
- Int
- Float
- Boolean
- ID

Custom Scalar Types

- Date
- DateTime
- Time

**Timeout and Limits**

Resolvers have a timeout set to 60 seconds. Additionally, the platform enforces a recursive call depth limit of 10 levels to prevent infinite loops when pipeline resolvers call other platform services. See [Platform Limits](/reference/platform/platform-limits#recursive-call-detection) for more details.

### Execution Order (Resolver level)

In the SDK, the execution order is straightforward: the `body` function executes your resolver logic directly. The flow is:

1. Input validation (via `t` type definitions and optional `.validate()` rules)
2. `body` function execution
3. Output validation (via output schema)

```typescript
import { createResolver, t } from "@tailor-platform/sdk";

export default createResolver({
  name: "myResolver",
  operation: "mutation",
  input: {
    email: t.string().validate(({ value }) => value.includes("@")),
  },
  body: async (context) => {
    // Your resolver logic executes here
    return { success: true };
  },
  output: t.object({
    success: t.boolean(),
  }),
});
```

## Pipeline steps

In the SDK, the concept of "pipeline steps" is replaced by direct TypeScript code in the `body` function. You can perform multiple database operations, call external services, and chain logic naturally using async/await.

**Example**

```typescript
import { createResolver, t } from "@tailor-platform/sdk";
import { getDB } from "../generated/tailordb";

export default createResolver({
  name: "createUserWithContract",
  operation: "mutation",
  input: {
    name: t.string(),
    email: t.string(),
    contractCode: t.int(),
  },
  body: async (context) => {
    const db = getDB("tailordb");

    // Step 1: Create user
    const user = await db
      .insertInto("User")
      .values({
        name: context.input.name,
        email: context.input.email,
      })
      .returning(["id", "name"])
      .executeTakeFirstOrThrow();

    // Step 2: Create contract linked to user
    const contract = await db
      .insertInto("Contract")
      .values({
        userId: user.id,
        code: context.input.contractCode,
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();

    return {
      userId: user.id,
      contractId: contract.id,
    };
  },
  output: t.object({
    userId: t.uuid(),
    contractId: t.uuid(),
  }),
});
```

### Execution Order (within a step)

In the SDK, there are no separate "steps" with pre/post scripts. Instead, you write TypeScript code directly in the `body` function, which gives you full control over execution order using standard programming constructs:

```typescript
import { createResolver, t } from "@tailor-platform/sdk";
import { getDB } from "../generated/tailordb";

export default createResolver({
  name: "processOrder",
  operation: "mutation",
  input: {
    orderId: t.uuid(),
  },
  body: async (context) => {
    const db = getDB("tailordb");

    // Validation (equivalent to PreValidation)
    const order = await db
      .selectFrom("Order")
      .selectAll()
      .where("id", "=", context.input.orderId)
      .executeTakeFirst();

    if (!order) {
      throw new Error("Order not found");
    }

    // Main operation
    await db.updateTable("Order").set({ status: "processed" }).where("id", "=", order.id).execute();

    // Post-processing (equivalent to PostScript)
    return { orderId: order.id, status: "processed" };
  },
  output: t.object({
    orderId: t.uuid(),
    status: t.string(),
  }),
});
```

## Data manipulation

### Input arguments

In the SDK, input arguments are accessed via `context.input` in the `body` function. This is a type-safe object based on your input schema definition.

For instance, given a resolver with `userID` and `contractID` inputs:

```typescript
import { createResolver, t } from "@tailor-platform/sdk";

export default createResolver({
  name: "bindUserToContract",
  operation: "mutation",
  input: {
    userID: t.uuid(),
    contractID: t.uuid(),
  },
  body: async (context) => {
    // Access input arguments via context.input
    const userId = context.input.userID;
    const contractId = context.input.contractID;

    // Use the values in your logic
    return { userId, contractId };
  },
  output: t.object({
    userId: t.uuid(),
    contractId: t.uuid(),
  }),
});
```

Data from previous operations is available as regular TypeScript variables, making data flow explicit and type-safe:

```typescript
body: async (context) => {
  const db = getDB("tailordb");

  // First operation
  const user = await db
    .insertInto("User")
    .values({ name: context.input.name })
    .returning(["id"])
    .executeTakeFirstOrThrow();

  // Use result from first operation directly
  const contract = await db
    .insertInto("Contract")
    .values({ userId: user.id })
    .returning(["id"])
    .executeTakeFirstOrThrow();

  return { userId: user.id, contractId: contract.id };
},
```

### Context

In the SDK, the `context` object is passed to the `body` function and provides access to:

- `context.input` - The validated input arguments
- `context.user` - Current user information (id, attributes, workspace_id, etc.)

Data from previous operations is simply stored in TypeScript variables:

```typescript
import { createResolver, t } from "@tailor-platform/sdk";
import { getDB } from "../generated/tailordb";

export default createResolver({
  name: "processUserData",
  operation: "mutation",
  input: {
    name: t.string(),
  },
  body: async (context) => {
    const db = getDB("tailordb");

    // Step 1: Create user
    const user = await db
      .insertInto("User")
      .values({ name: context.input.name })
      .returning(["id"])
      .executeTakeFirstOrThrow();

    // Step 2: Do something else
    const profile = await db
      .insertInto("Profile")
      .values({ userId: user.id })
      .returning(["id"])
      .executeTakeFirstOrThrow();

    // Step 3: Reference results from earlier operations
    return {
      userId: user.id,
      profileId: profile.id,
    };
  },
  output: t.object({
    userId: t.uuid(),
    profileId: t.uuid(),
  }),
});
```

Access user context for authorization:

```typescript
body: async (context) => {
  // Access current user information
  const currentUserId = context.user.id;
  const userAttributes = context.user.attributes;

  // Use in your logic
  return { userId: currentUserId };
},
```

### Configuration data

In the SDK, you can access shared configuration data using standard TypeScript imports. Simply import your configuration objects and use them directly in your resolver:

```typescript
import { createResolver, t } from "@tailor-platform/sdk";
import { settings } from "../config/settings";

export default createResolver({
  name: "myResolver",
  operation: "query",
  input: {
    key: t.string(),
  },
  body: async (context) => {
    // Access shared configuration directly via imports
    const sharedValue = settings.shared.value;

    return { result: sharedValue };
  },
  output: t.object({
    result: t.string(),
  }),
});
```

You can also use environment variables:

```typescript
body: async (context) => {
  const apiKey = process.env.API_KEY;
  // Use the configuration in your logic
  return { configured: !!apiKey };
},
```

### Iteration and loops

In the SDK, you use standard JavaScript iteration constructs like `for...of` loops or array methods like `map`, `forEach`, and `Promise.all`:

```typescript
import { createResolver, t } from "@tailor-platform/sdk";
import { getDB } from "../generated/tailordb";

export default createResolver({
  name: "processProducts",
  operation: "mutation",
  input: {
    productIds: t.array(t.uuid()),
  },
  body: async (context) => {
    const db = getDB("tailordb");
    const results = [];

    // Iterate over products using for...of
    for (const productId of context.input.productIds) {
      const product = await db
        .selectFrom("Product")
        .selectAll()
        .where("id", "=", productId)
        .executeTakeFirstOrThrow();

      results.push({
        id: product.id,
        name: product.name,
      });
    }

    return { products: results };
  },
  output: t.object({
    products: t.array(
      t.object({
        id: t.uuid(),
        name: t.string(),
      }),
    ),
  }),
});
```

For parallel processing, use `Promise.all`:

```typescript
body: async (context) => {
  const db = getDB("tailordb");

  const products = await Promise.all(
    context.input.productIds.map(async (productId) => {
      return db
        .selectFrom("Product")
        .selectAll()
        .where("id", "=", productId)
        .executeTakeFirstOrThrow();
    })
  );

  return { products };
},
```
