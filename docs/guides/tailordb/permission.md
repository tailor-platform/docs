---
description: "Control access with Permission for record-level rules and GQLPermission for operation-level rules, and migrate from the legacy permission system."
doc_type: guide
sdk_version: "2.25.0"
---

# Permission

TailorDB's permission system provides enhanced flexibility and performance for controlling access to your data. It introduces two key resources that work together to provide comprehensive access control:

- **`Permission`** - Record-level access control
- **`GQLPermission`** - GraphQL operation-level access control

The new permission system is recommended for all new applications. It addresses several limitations of the legacy permission system (deprecated) including better performance, support for non-UUID fields, and the ability to reference record values directly in permission rules.

## Permission (Record-Level Control)

`Permission` is defined within the Type resource and controls which users can operate on which records.

### Basic Structure

```typescript
db.table("Example", {
  // field definitions
}).permission({
  create: [/* policies */],
  read: [/* policies */],
  update: [/* policies */],
  delete: [/* policies */],
});
```

### Permission Types

Each permission type has different semantics:

#### Read Permission

Read Permission act as automatic filters. Only records that match at least one policy can be retrieved.

```typescript
db.table("Example", {
  userId: db.uuid(),
}).permission({
  create: [],
  read: [[{ record: "userId" }, "=", { user: "id" }]],
  update: [],
  delete: [],
});
```

All four of `create`, `read`, `update` and `delete` must be present. An empty array denies the operation, which matches the secure-by-default behaviour.

#### Create/Update/Delete Permissions

These Permissions act as validation rules. If a record doesn't match any policy, the operation is prohibited and returns a permission denied error.

```typescript
db.table("Example", {
  // fields
}).permission({
  create: [[{ user: "role" }, "=", "ADMIN"]],
  read: [],
  update: [],
  delete: [],
});
```

### Policy Evaluation

Multiple policies can be defined for each permission type. The evaluation follows these rules:

- **Explicit allow required**: If no policy matches, access is denied by default (implicit deny)
- **Any matching policy grants access**: `.permission()` policies are plain condition arrays with no `permit` field and no explicit-deny mechanism — if any policy's conditions all match, the operation is permitted. (An explicit `permit: false` deny-override is only available on `.gqlPermission()` policies, which use a different `{ conditions, permit }` shape — see [GQLPermission](#gqlpermission-graphql-level-control).)
- **All conditions must match**: Within a policy, all conditions must be satisfied for the policy to match

### Operands

The following operands can be used in conditions:

#### `record`

Uses the value of a specified field from the record. Cannot be used in Update Permission (use `oldRecord` or `newRecord` instead).

Supported field types: `String`, `UUID`, `Enum`, `Boolean`, and their array forms.

```typescript
// Check if the record's status is "TODO"
[{ record: "status" }, "=", "TODO"];
```

#### `oldRecord` / `newRecord`

Used in Update Permission to reference the existing or updated record values. Cannot be used in Create/Read/Delete Permissions.

The supported field types are the same as for `record`.

```typescript
// Check if the old record's assigneeId matches the user ID
[{ oldRecord: "assigneeId" }, "=", { user: "id" }];
```

#### `user`

Uses the value of a specified field from the user's AttributeMap (defined in the Auth service).

```typescript
// Check if the user's role is "ADMIN"
[{ user: "role" }, "=", "ADMIN"];
```

#### `value`

Uses a specified value directly. Supports `String`, `Boolean`, and their array types.

```typescript
// Check if the record's status is in a specific set of values
[{ record: "status" }, "in", ["TODO", "IN_PROGRESS"]];
```

### Operators

The following operators are supported:

#### `eq` / `ne`

Equality and inequality comparison.

```typescript
// Check if the record's status is "TODO"
[{ record: "status" }, "=", "TODO"];

// Check if the user's role is not "ADMIN"
[{ user: "role" }, "!=", "ADMIN"];
```

#### `in` / `not in`

Array membership and non-membership.

```typescript
// Check if the record's status is in a set of values
[{ record: "status" }, "in", ["TODO", "IN_PROGRESS"]];

// Check if the user's role is not in a set of values
[{ user: "role" }, "not in", ["GUEST", "USER"]];
```

#### `hasAny` / `not hasAny`

Array overlap and non-overlap. Checks whether two string arrays share any common elements. Both operands must be string arrays.

- `hasAny` — true if the two arrays have at least one element in common
- `not hasAny` — true if the two arrays have no elements in common

Supported array field types: `String`, `UUID`, `Enum`.

```typescript
// Check if the record's roles share any values with the given list
[{ record: "roles" }, "hasAny", ["ADMIN", "EDITOR"]];

// Check if the user's roles have no overlap with restricted roles
[{ user: "roles" }, "not hasAny", ["BLOCKED", "SUSPENDED"]];
```

You can also compare a user attribute array against a record field array:

```typescript
// Allow access if the user's roles overlap with the record's allowedRoles
[{ user: "roles" }, "hasAny", { record: "allowedRoles" }];
```

### Complete Example

```typescript
db.table("Task", {
  title: db.string().description("Task title"),
  status: db
    .enum([
      { value: "TODO", description: "Task is pending" },
      { value: "IN_PROGRESS", description: "Task is currently being worked on" },
      { value: "DONE", description: "Task has been completed" },
    ])
    .description("Task status")
    .default("TODO"),
  assigneeId: db
    .uuid()
    .description("ID of the user assigned to this task")
    .hooks({ create: ({ invoker }) => invoker?.id ?? "" }),
}).permission({
  create: [
    // Administrators can create any task
    [{ user: "role" }, "=", "ADMIN"],
    // Users can create tasks assigned to themselves with TODO status
    [
      [{ record: "assigneeId" }, "=", { user: "id" }],
      [{ record: "status" }, "=", "TODO"],
    ],
  ],
  read: [
    // Administrators can read all tasks
    [{ user: "role" }, "=", "ADMIN"],
    // Users can read tasks assigned to them
    [{ record: "assigneeId" }, "=", { user: "id" }],
  ],
  update: [
    // Administrators can update any task
    [{ user: "role" }, "=", "ADMIN"],
    // Users can update tasks assigned to them
    [
      [{ oldRecord: "assigneeId" }, "=", { user: "id" }],
      [{ newRecord: "assigneeId" }, "=", { user: "id" }],
    ],
  ],
  delete: [
    // Administrators can delete any task
    [{ user: "role" }, "=", "ADMIN"],
  ],
});
```

## GQLPermission (GraphQL-Level Control)

`GQLPermission` controls which users can execute specific GraphQL operations. It is defined with the `.gqlPermission()` modifier on the table, which takes an array of policies. This setting does not affect SQL execution via the Function service.

### Basic Structure

```typescript
db.table("Example", {
  // field definitions
}).gqlPermission([
  {
    conditions: [/* conditions */],
    actions: [/* actions */],
    permit: true, // or false to deny
    description: "Policy description",
  },
]);
```

`permit` is a boolean. Omitting it defaults to deny and emits a warning, so always set it explicitly.

### Conditions

The method for defining Conditions is basically the same as `Permission`. Just note that `record` / `oldRecord` / `newRecord` operands are not available here.

### Actions

Each GraphQL operation is categorized into the following actions:

| Action       | GraphQL operation                                  |
| ------------ | -------------------------------------------------- |
| `create`     | `create<Type>` mutation                            |
| `read`       | `get<Type>`, `get<Type>By`, `list<Type>s` queries  |
| `update`     | `update<Type>` mutation                            |
| `delete`     | `delete<Type>` mutation                            |
| `aggregate`  | `aggregate<Type>` query                            |
| `bulkUpsert` | `bulkUpsert<Type>`, `bulkUpsert<Type>By` mutations |

To cover every operation for the type, set `actions: "all"` — the string on its own, not inside an array.

### Complete Example

```typescript
db.table("Task", {
  // field definitions
}).gqlPermission([
  {
    conditions: [[{ user: "role" }, "=", "ADMIN"]],
    actions: "all",
    permit: true,
    description: "Administrators have full access to all GraphQL operations",
  },
  {
    conditions: [[{ user: "_loggedIn" }, "=", true]],
    actions: ["create", "read", "update"],
    permit: true,
    description: "Authenticated users can create, read, and update tasks",
  },
]);
```

## Auth Integration

User attributes referenced in permissions are defined through the Auth service configuration.

### User Profile Configuration

```typescript
import { defineAuth } from "@tailor-platform/sdk";
import { user } from "./db/user";

export const auth = defineAuth("main-auth", {
  userProfile: {
    type: user,
    // Must be a required, unique, non-array string field of the table
    usernameField: "email",
    attributes: {
      // Expose the value of the role field as "role" for the "user" operand
      role: true,
    },
  },
});
```

### Machine User Configuration

```typescript
import { defineAuth, t } from "@tailor-platform/sdk";

export const auth = defineAuth("machine-auth", {
  machineUserAttributes: {
    role: t.string(),
  },
  machineUsers: {
    // Set the role attribute to "ADMIN"
    admin: { attributes: { role: "ADMIN" } },
  },
});
```

### Built-in User Attributes

In addition to custom attributes, two built-in fields are always available:

#### `id`

The user's unique identifier.

```typescript
// Check if the user ID matches the record's assigneeId
[{ user: "id" }, "=", { record: "assigneeId" }];
```

#### `_loggedIn`

Boolean indicating whether the user is authenticated.

```typescript
// Check if the user is logged in
[{ user: "_loggedIn" }, "=", true];
```

## SQL Operation Behavior

Unlike `GQLPermission`, `Permission` is enforced at the SQL level as well.

For detailed information about how the settings affect SQL operations when accessing TailorDB via the Function service, see [Permission Enforcement](/guides/function/accessing-tailordb#permission-enforcement).

## GraphQL Operation Behavior

When accessing TailorDB via GraphQL, `Permission` required for each operation is determined based on the corresponding equivalent SQL:

### Create Operations

```graphql
mutation {
  createTask(input: { title: "New task" }) {
    id
  }
}
```

**SQL Equivalent**: `INSERT INTO "Task" ("title") VALUES ('New task') RETURNING "id"`

**Required Permissions**:

- Permission: Create, Read (for returning created record)
- GQLPermission: Create

### Read Operations

```graphql
query {
  tasks(query: { status: { eq: "TODO" } }, first: 10) {
    edges {
      node {
        id
        title
      }
    }
  }
}
```

**SQL Equivalent**: `SELECT "id", "title" FROM "Task" WHERE "status" = 'TODO' LIMIT 10`

**Required Permissions**:

- Permission: Read
- GQLPermission: Read

### Update Operations

```graphql
mutation {
  updateTask(
    id: "<uuid>"
    input: { status: "DONE" }
    condition: { status: { eq: "IN_PROGRESS" } }
  ) {
    id
  }
}
```

**SQL Equivalent**: `UPDATE "Task" SET "status" = 'DONE' WHERE "id" = 'uuid' AND "status" = 'IN_PROGRESS' RETURNING "id"`

**Required Permissions**:

- Permission: Update, Read (for candidate record retrieval and returning updated record)
- GQLPermission: Update

### Delete Operations

```graphql
mutation {
  deleteTask(id: "<uuid>")
}
```

**SQL Equivalent**: `DELETE FROM "Task" WHERE "id" = 'uuid'`

**Required Permissions**:

- Permission: Delete, Read (for candidate record retrieval)
- GQLPermission: Delete

### Bulk Upsert Operations

```graphql
mutation {
  bulkUpsertTasksBy(
    field: title
    input: [{ title: "Task 1", status: "TODO" }, { title: "Task 2", status: "DONE" }]
  )
}
```

**SQL Equivalent**: `INSERT INTO "Task" ("title", "status") VALUES ('Task 1', 'TODO'), ('Task 2', 'DONE') ON CONFLICT ("title") DO UPDATE SET "status" = EXCLUDED."status"`

**Required Permissions**:

- Permission: Create (INSERT case), Update + Read (UPDATE case)
- GQLPermission: BulkUpsert

### Aggregate Operations

```graphql
query {
  aggregateTasks {
    groupBy {
      status
    }
    count
  }
}
```

**SQL Equivalent**: `SELECT "status", COUNT(*) FROM "Task" GROUP BY "status"`

**Required Permissions**:

- Permission: Read
- GQLPermission: Aggregate

## Compatibility

- When both `Permission` and `RecordPermission` are defined, `Permission` takes precedence
- When both `GQLPermission` and `TypePermission` are defined, `GQLPermission` takes precedence
- This ensures backward compatibility while enabling gradual migration
