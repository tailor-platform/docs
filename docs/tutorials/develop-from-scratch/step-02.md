# Step 2: Add Authentication and Permissions

This step adds authentication capabilities to your project management application. You'll configure user profile management linked to your User type and create machine users for different roles, enabling secure access control and automated operations. You will also implement role-based permissions to control data access.

[Source code on GitHub](https://github.com/tailor-platform/templates/tree/main/docs/build-from-scratch/sdk/step-02)

## Configuration Files

```typescript {{title: 'tailor.config.ts'}}
import { defineAuth, defineConfig } from "@tailor-platform/sdk";
import { user } from "./src/db/user";

export default defineConfig({
  name: "project-management",
  db: { "main-db": { files: [`./src/db/*.ts`] } },
  auth: defineAuth("main-auth", {
    userProfile: {
      type: user,
      usernameField: "email",
      attributes: {
        role: true,
      },
    },
    machineUsers: {
      manager: {
        attributes: { role: "MANAGER" },
      },
      staff: {
        attributes: { role: "STAFF" },
      },
    },
  }),
});
```

```typescript {{title: 'src/common/permission.ts'}}
import type {
  PermissionCondition,
  TailorTypeGqlPermission,
  TailorTypePermission,
} from "@tailor-platform/sdk";

export interface User {
  role: string;
}

export const loggedIn = [{ user: "_loggedIn" }, "=", true] as const satisfies PermissionCondition;

export const permissionLoggedIn = {
  create: [loggedIn],
  read: [loggedIn],
  update: [loggedIn],
  delete: [loggedIn],
} as const satisfies TailorTypePermission;

export const gqlPermissionLoggedIn = [
  {
    conditions: [loggedIn],
    actions: "all",
    permit: true,
  },
] as const satisfies TailorTypeGqlPermission;
```

All three types now import and apply permissions via `.permission()` (record-level) and `.gqlPermission()` (GraphQL-level). Both layers must pass for an operation to succeed.

```typescript {{title: 'src/db/user.ts'}}
import { db } from "@tailor-platform/sdk";
import { gqlPermissionLoggedIn, permissionLoggedIn } from "../common/permission";

export const user = db
  .type("User", {
    name: db.string().description("Name of the user"),
    email: db.string().unique().description("Email address of the user"),
    role: db.enum(["MANAGER", "STAFF"]),
    ...db.fields.timestamps(),
  })
  .permission(permissionLoggedIn)
  .gqlPermission(gqlPermissionLoggedIn);
```

```typescript {{title: 'src/db/project.ts'}}
import { db } from "@tailor-platform/sdk";
import { gqlPermissionLoggedIn, permissionLoggedIn } from "../common/permission";

export const project = db
  .type("Project", {
    name: db.string().description("Name of the Project"),
    description: db.string({ optional: true }).description("Description of the project"),
    status: db.enum([
      { value: "PLANNING", description: "Planning status" },
      { value: "IN_PROGRESS", description: "In Progress status" },
      { value: "ON_HOLD", description: "On hold status" },
      { value: "COMPLETED", description: "Completed status" },
      { value: "CANCELED", description: "Canceled status" },
      { value: "CLOSED", description: "Closed status" },
    ]),
    startDate: db.date({ optional: true }).description("Start date of the project"),
    endDate: db.date({ optional: true }).description("End date of the project"),
    ...db.fields.timestamps(),
  })
  .permission(permissionLoggedIn)
  .gqlPermission(gqlPermissionLoggedIn);
```

```typescript {{title: 'src/db/task.ts'}}
import { db } from "@tailor-platform/sdk";
import { project } from "./project";
import { user } from "./user";
import { gqlPermissionLoggedIn, permissionLoggedIn } from "../common/permission";

export const task = db
  .type("Task", {
    name: db.string().description("Name of the Task"),
    description: db.string({ optional: true }).description("Description of the task"),
    projectId: db
      .uuid()
      .description("ID of the project the task belongs to")
      .relation({ type: "n-1", toward: { type: project } }),
    assigneeId: db
      .uuid({ optional: true })
      .description("ID of the user assigned to the task")
      .relation({ type: "n-1", toward: { type: user } }),
    status: db.enum([
      { value: "TODO", description: "To Do status" },
      { value: "IN_PROGRESS", description: "In Progress status" },
      { value: "IN_REVIEW", description: "In Review status" },
      { value: "DONE", description: "Done status" },
      { value: "CANCELED", description: "Canceled status" },
    ]),
    dueDate: db.date().description("Due date of the task"),
    ...db.fields.timestamps(),
  })
  .permission(permissionLoggedIn)
  .gqlPermission(gqlPermissionLoggedIn);
```

## File Tree

```
project-management/
├── package.json
├── tsconfig.json
├── tailor.config.ts
└── src/
    ├── common/
    │   └── permission.ts          # New
    └── db/
        ├── user.ts                # Updated with permissions
        ├── project.ts             # Updated with permissions
        └── task.ts                # Updated with permissions
```

## Deploy

```bash
npm run deploy
```

## Next Step

[Step 3: Add Resolver](/tutorials/develop-from-scratch/step-03)
