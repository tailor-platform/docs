# Creating Custom Resolvers

Resolvers are custom GraphQL endpoints that implement business logic. In this tutorial, you'll create a mutation resolver that assigns a task to a team member with validation.

- To follow along with this tutorial, first complete the [SDK Quickstart](../sdk/quickstart). It provides the app template that we'll build upon.

## Tutorial Steps

1. Set up the data schema
2. Configure the resolver service
3. Create the resolver
4. Deploy and test
5. View execution logs

## 1. Set up the Data Schema

First, create the necessary types in TailorDB. Create two files in your `db/` directory:

**Project Type:**

```typescript
import { db } from "@tailor-platform/sdk";

export const project = db.type("Project", {
  name: db.string().description("Project name"),
  description: db.string().optional().description("Project description"),
  status: db.enum(["active", "completed", "archived"]).description("Project status"),
  ...db.fields.timestamps(),
});
export type project = typeof project;
```

**Task and TeamMember Types:**

```typescript
import { db } from "@tailor-platform/sdk";
import { project } from "./project";

export const teamMember = db.type("TeamMember", {
  name: db.string().description("Team member name"),
  email: db.string().description("Team member email"),
  role: db.string().optional().description("Team member role"),
  ...db.fields.timestamps(),
});
export type teamMember = typeof teamMember;

export const task = db.type("Task", {
  title: db.string().description("Task title"),
  description: db.string().optional().description("Task description"),
  status: db.enum(["todo", "in_progress", "completed"]).description("Task status"),
  priority: db.enum(["low", "medium", "high"]).description("Task priority"),
  projectId: db.uuid().relation({ type: "n-1", toward: { type: project } }).description("Associated project"),
  assigneeId: db.uuid().relation({ type: "n-1", toward: { type: teamMember } }).optional().description("Assigned team member"),
  dueDate: db.string().optional().description("Due date"),
  ...db.fields.timestamps(),
});
export type task = typeof task;
```

## 2. Configure the Resolver Service

Update your `tailor.config.ts` to include the resolver service:

```typescript
import { defineConfig } from "@tailor-platform/sdk";

export default defineConfig({
  name: "project-management",
  db: {
    "project-db": {
      files: ["db/**/*.ts"],
    },
  },
  resolver: {
    "project-resolver": {
      files: ["resolver/**/*.ts"],
    },
  },
});
```

This configures the SDK to load resolver definitions from the `resolver/` directory.

## 3. Create the Resolver

Create a new file `resolver/assign-task.ts` with the following resolver definition:

```typescript
import { createResolver, t } from "@tailor-platform/sdk";
import { getDB } from "../generated/tailordb";

export default createResolver({
  name: "assignTask",
  operation: "mutation",
  description: "Assign a task to a team member with validation",
  input: {
    taskId: t.string().description("ID of the task to assign"),
    assigneeId: t.string().description("ID of the team member"),
    dueDate: t.string().optional().description("Optional due date"),
  },
  body: async (context) => {
    const db = getDB("project-db");

    // Check if task exists
    const task = await db
      .selectFrom("Task")
      .selectAll()
      .where("id", "=", context.input.taskId)
      .executeTakeFirstOrThrow();

    // Check if assignee exists
    const assignee = await db
      .selectFrom("TeamMember")
      .selectAll()
      .where("id", "=", context.input.assigneeId)
      .executeTakeFirstOrThrow();

    // Update task
    await db
      .updateTable("Task")
      .set({
        assigneeId: context.input.assigneeId,
        status: "in_progress",
        dueDate: context.input.dueDate || task.dueDate,
        updatedAt: new Date().toISOString(),
      })
      .where("id", "=", context.input.taskId)
      .execute();

    return {
      taskId: task.id,
      taskTitle: task.title,
      assigneeName: assignee.name,
      message: `Task "${task.title}" assigned to ${assignee.name}`,
    };
  },
  output: t.object({
    taskId: t.string().description("ID of the assigned task"),
    taskTitle: t.string().description("Title of the task"),
    assigneeName: t.string().description("Name of the assignee"),
    message: t.string().description("Success message"),
  }),
});
```

### How This Resolver Works

1. **Input Validation**: The resolver accepts `taskId`, `assigneeId`, and an optional `dueDate`
2. **Database Queries**: Uses Kysely query builder to fetch task and team member records
3. **Validation**: Throws an error if the task or assignee doesn't exist (via `executeTakeFirstOrThrow()`)
4. **Update Logic**: Updates the task with the new assignee, changes status to "in_progress", and updates the timestamp
5. **Response**: Returns the task details and a success message

## 4. Deploy and Test

First, generate Kysely types for type-safe database queries:

```bash
npm run generate
```

This generates TypeScript types and the `getDB()` helper in the `generated/` directory based on your TailorDB schema.

Then deploy your changes to the workspace:

```bash
npm run deploy -- --workspace-id <your-workspace-id>
```

The SDK will deploy your TailorDB schema and the resolver to your workspace.

### Test the Resolver

First, create some test data. Open the GraphQL Playground in the [Console](https://console.tailor.tech) and create a project, team member, and task:

```graphql
mutation {
  createProject(
    input: {
      name: "Website Redesign"
      description: "Redesign company website"
      status: "active"
      createdAt: "2026-02-09T10:00:00Z"
    }
  ) {
    id
    name
  }
}

mutation {
  createTeamMember(
    input: { name: "Alice Johnson", email: "alice@example.com", role: "Developer" }
  ) {
    id
    name
  }
}

mutation {
  createTask(
    input: {
      title: "Design homepage mockup"
      description: "Create initial design concepts"
      status: "todo"
      priority: "high"
      projectId: "<project-id>"
      createdAt: "2026-02-09T10:00:00Z"
      updatedAt: "2026-02-09T10:00:00Z"
    }
  ) {
    id
    title
  }
}
```

Now test the `assignTask` resolver:

```graphql
mutation {
  assignTask(
    input: { taskId: "<task-id>", assigneeId: "<team-member-id>", dueDate: "2026-02-15T17:00:00Z" }
  ) {
    taskId
    taskTitle
    assigneeName
    message
  }
}
```

Expected response:

```json
{
  "data": {
    "assignTask": {
      "taskId": "<task-id>",
      "taskTitle": "Design homepage mockup",
      "assigneeName": "Alice Johnson",
      "message": "Task \"Design homepage mockup\" assigned to Alice Johnson"
    }
  }
}
```

## 5. View Execution Logs

You can view resolver execution logs in the [Console](https://console.tailor.tech). Navigate to your workspace and select the `Execution Logs` tab to see:

- Input parameters for each resolver call
- Execution time and status
- Response data or error messages
- Database queries performed

This helps you debug issues and understand how your resolver processes requests.

## Advanced: Triggering Executors from Resolvers

You can configure resolvers to publish events when they execute, allowing executors to trigger automatically after resolver execution. This is useful for post-processing tasks like sending notifications or updating related data.

```typescript
export default createResolver({
  name: "assignTask",
  operation: "mutation",
  publishEvents: true, // Enable event publishing
  // ... rest of resolver config
});
```

**How it works:**

- When `publishEvents: true`, the resolver publishes execution events
- Executors can listen for these events using `resolverExecutedTrigger()`
- The SDK **automatically enables** `publishEvents` when an executor references the resolver

**Example executor that triggers after resolver execution:**

```typescript
import { createExecutor, resolverExecutedTrigger } from "@tailor-platform/sdk";
import assignTaskResolver from "../resolver/assign-task";

export default createExecutor({
  name: "notify-task-assigned",
  trigger: resolverExecutedTrigger({
    resolver: assignTaskResolver,
    condition: ({ result, error }) => !error && !!result.taskId,
  }),
  operation: {
    kind: "function",
    body: async ({ result }) => {
      console.log(`Task ${result.taskId} assigned to ${result.assigneeName}`);
      // Send notification logic here
    },
  },
});
```

For more details, see [Executor Service - Resolver Executed Trigger](../sdk/services/executor#resolver-executed-trigger).

## Next Steps

Learn more about resolvers:

- [Resolver Guide](../guides/resolver) - Complete resolver guide with examples
- [Input Validation](../guides/tailordb/validations) - Add validation rules to your data
- [TailorDB Overview](../guides/tailordb/overview) - Learn about database schema and queries
