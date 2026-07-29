---
doc_type: guide
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
db.type("Example", {
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
db.type("Example", {
  userId: db.uuid(),
}).permission({
  read: [[{ record: "userId" }, "=", { user: "id" }]],
});
```

#### Create/Update/Delete Permissions

These Permissions act as validation rules. If a record doesn't match any policy, the operation is prohibited and returns a permission denied error.

```typescript
db.type("Example", {
  // fields
}).permission({
  create: [[{ user: "role" }, "=", "ADMIN"]],
});
```

### Policy Evaluation

Multiple policies can be defined for each permission type. The evaluation follows these rules:

- **Explicit allow required**: If no policy matches, access is denied by default (implicit deny)
- **Explicit deny takes precedence**: A policy with `permit = "deny"` always overrides allow policies
- **All conditions must match**: Within a policy, all conditions must be satisfied for the policy to match

### Operands

The following operands can be used in conditions:

#### `record`

Uses the value of a specified field from the record. Cannot be used in Update Permission (use `old_record` or `new_record` instead).

Supported field types: `String`, `UUID`, `Enum`, `Boolean`, and their array forms.

```typescript
// Check if the record's status is "TODO"
[{ record: "status" }, "=", "TODO"];
```

#### `old_record` / `new_record`

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
[{ record: "status" }, "=", "TODO"][
  // Check if the user's role is not "ADMIN"
  ({ user: "role" }, "!=", "ADMIN")
];
```

#### `in` / `nin`

Array membership and non-membership.

```typescript
// Check if the record's status is in a set of values
[{ record: "status" }, "in", ["TODO", "IN_PROGRESS"]][
  // Check if the user's role is not in a set of values
  ({ user: "role" }, "nin", ["GUEST", "USER"])
];
```

#### `hasAny` / `nhasAny`

Array overlap and non-overlap. Checks whether two string arrays share any common elements. Both operands must be string arrays.

- `hasAny` — true if the two arrays have at least one element in common
- `nhasAny` — true if the two arrays have no elements in common

Supported array field types: `String`, `UUID`, `Enum`.

```typescript
// Check if the record's roles share any values with the given list
[{ record: "roles" }, "hasAny", ["ADMIN", "EDITOR"]][
  // Check if the user's roles have no overlap with restricted roles
  ({ user: "roles" }, "nhasAny", ["BLOCKED", "SUSPENDED"])
];
```

You can also compare a user attribute array against a record field array:

```typescript
// Allow access if the user's roles overlap with the record's allowedRoles
[{ user: "roles" }, "hasAny", { record: "allowedRoles" }];
```

### Complete Example

```typescript
const TaskStatus = db.enum("TaskStatus", [
  { value: "TODO", description: "Task is pending" },
  { value: "IN_PROGRESS", description: "Task is currently being worked on" },
  { value: "DONE", description: "Task has been completed" },
]);

db.type("Task", {
  title: db.string({ required: true, description: "Task title" }),
  status: TaskStatus({
    description: "Task status",
    hooks: { create: "'TODO'" },
  }),
  assigneeId: db.uuid({
    description: "ID of the user assigned to this task",
    hooks: { create: "user.id" },
  }),
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

`GQLPermission` is defined as a separate resource and controls which users can execute specific GraphQL operations. This setting does not affect SQL execution via the Function service.

### Basic Structure

```typescript
db.gqlPermission("Example", {
  policies: [
    {
      conditions: [/* conditions */],
      actions: [/* actions */],
      permit: "allow", // or "deny"
      description: "Policy description",
    },
  ],
});
```

### Conditions

The method for defining Conditions is basically the same as `Permission`. Just note that `record` / `old_record` / `new_record` operands are not available here.

### Actions

Each GraphQL operation is categorized into the following actions:

| Action        | GraphQL operation                                  |
| ------------- | -------------------------------------------------- |
| `all`         | All GraphQL operations for the type                |
| `create`      | `create<Type>` mutation                            |
| `read`        | `get<Type>`, `get<Type>By`, `list<Type>s` queries  |
| `update`      | `update<Type>` mutation                            |
| `delete`      | `delete<Type>` mutation                            |
| `aggregate`   | `aggregate<Type>` query                            |
| `bulk_upsert` | `bulkUpsert<Type>`, `bulkUpsert<Type>By` mutations |

### Complete Example

```typescript
db.gqlPermission("Task", {
  policies: [
    {
      conditions: [[{ user: "role" }, "=", "ADMIN"]],
      actions: ["all"],
      permit: "allow",
      description: "Administrators have full access to all GraphQL operations",
    },
    {
      conditions: [[{ user: "loggedIn" }, "=", true]],
      actions: ["create", "read", "update"],
      permit: "allow",
      description: "Authenticated users can create, read, and update tasks",
    },
  ],
});
```

## Auth Integration

User attributes referenced in permissions are defined through the Auth service configuration.

### User Profile Configuration

```typescript
auth.idp.tailordb({
  type: "User",
  usernameField: "email",
  attributeMap: {
    // Reference the value of the role field as "role" using the "user" operand
    role: "role",
  },
});
```

### Machine User Configuration

```typescript
auth.machineUser("admin", {
  // Set the role attribute to "ADMIN"
  role: "ADMIN",
});
```

### Built-in User Attributes

In addition to custom attributes, two built-in fields are always available:

#### `_id`

The user's unique identifier.

```typescript
// Check if the user ID matches the record's assigneeId
[{ user: "id" }, "=", { record: "assigneeId" }];
```

#### `_loggedIn`

Boolean indicating whether the user is authenticated.

```typescript
// Check if the user is logged in
[{ user: "loggedIn" }, "=", true];
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
