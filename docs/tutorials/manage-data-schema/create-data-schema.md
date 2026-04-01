# Adding a New Data Model

With Tailor Platform's TailorDB, you can easily add new types (data models) to your application. The GraphQL API will be automatically generated for the new type.

This tutorial demonstrates how to create a new data schema using the SDK.

- See [Core Concepts](/getting-started/core-concepts) to get an overview of Workspace, Organization, Application and Service.
- To follow along with this tutorial, first complete the [SDK Quickstart](../../sdk/quickstart) and the [Data Schema Basics](data-schema-basics) tutorial.

## Tutorial Steps

To create a `Task` type in TailorDB, you'll need to:

1. Define the `Task` schema
2. Deploy the change
3. Verify the schema change through GraphQL

### 1. Define the Task Schema

Create a new file `db/task.ts` in your project and define the Task type:

```typescript
import { db } from "@tailor-platform/sdk";
import { project } from "./project";

export const task = db.type("Task", {
  title: db.string().description("Task title"),
  description: db.string().optional().description("Task description"),
  status: db
    .enum(["todo", "in_progress", "completed", "blocked"])
    .description("Current task status"),
  priority: db.enum(["low", "medium", "high", "urgent"]).description("Task priority level"),
  projectId: db.uuid().relation({ type: "n-1", toward: { type: project } }).description("Associated project"),
  assigneeId: db.string().optional().description("ID of assigned team member"),
  dueDate: db.string().optional().description("Task due date"),
  estimatedHours: db.float().optional().description("Estimated hours to complete"),
  ...db.fields.timestamps(),
});
export type task = typeof task;
```

**Schema Explanation:**

- **title**: Required string field for the task name
- **description**: Optional detailed description
- **status**: Enumeration with predefined status values
- **priority**: Enumeration for priority levels
- **projectId**: Many-to-one relation to the Project type
- **assigneeId**: Optional reference to a team member
- **dueDate**: Optional date field
- **estimatedHours**: Optional float for time estimation
- **createdAt/updatedAt**: Timestamp fields

Fields like `id` are automatically generated without being explicitly defined. See [Auto-generated Fields](../../sdk/services/tailordb#auto-generated-fields) for more information.

### 2. Deploy the Change

Deploy the new Task type to your workspace:

```bash
npm run deploy -- --workspace-id <your-workspace-id>
```

The SDK will:

- Detect the new type definition
- Create the Task table in TailorDB
- Generate the GraphQL API for the Task type

### 3. Verify Schema Change Through GraphQL

The SDK automatically generates the following GraphQL APIs for the `Task` type:

- **Queries**: `task`, `tasks` - Fetch task data
- **Mutations**: `createTask`, `updateTask`, `deleteTask` - Modify task data

Open the GraphQL Playground in the [Console](https://console.tailor.tech) and test the new API.

First, ensure you have a project created (from the previous tutorials). Then create a task:

```graphql
mutation {
  createTask(
    input: {
      title: "Design homepage mockup"
      description: "Create initial design concepts for the new homepage"
      status: "todo"
      priority: "high"
      projectId: "<your-project-id>"
      estimatedHours: 8.0
      dueDate: "2026-02-15T17:00:00Z"
      createdAt: "2026-02-09T10:00:00Z"
      updatedAt: "2026-02-09T10:00:00Z"
    }
  ) {
    id
    title
    status
    priority
  }
}
```

Example response:

```json
{
  "data": {
    "createTask": {
      "id": "a80ccddb-2f42-4ac3-a298-a6a766a24316",
      "title": "Design homepage mockup",
      "status": "todo",
      "priority": "high"
    }
  }
}
```

You can view the Task resource values in the [Console](https://console.tailor.tech).

Query the task to verify all fields:

```graphql
query {
  task(id: "a80ccddb-2f42-4ac3-a298-a6a766a24316") {
    id
    title
    description
    status
    priority
    projectId
    assigneeId
    dueDate
    estimatedHours
    createdAt
    updatedAt
  }
}
```

Example response:

```json
{
  "data": {
    "task": {
      "id": "a80ccddb-2f42-4ac3-a298-a6a766a24316",
      "title": "Design homepage mockup",
      "description": "Create initial design concepts for the new homepage",
      "status": "todo",
      "priority": "high",
      "projectId": "<your-project-id>",
      "assigneeId": null,
      "dueDate": "2026-02-15T17:00:00Z",
      "estimatedHours": 8.0,
      "createdAt": "2026-02-09T10:00:00Z",
      "updatedAt": "2026-02-09T10:00:00Z"
    }
  }
}
```

You can also query all tasks:

```graphql
query {
  tasks {
    edges {
      node {
        id
        title
        status
        priority
        dueDate
      }
    }
  }
}
```

## Next Steps

Now that you've created a new type, explore more advanced features:

- [Relationships](../../sdk/services/tailordb#relationships) - Define relations between types
- [Field Types](../../sdk/services/tailordb#field-types) - Learn about all available field types
- [Indexes](../../sdk/services/tailordb#indexes) - Optimize query performance
- [Hooks](../../sdk/services/tailordb#hooks) - Add automatic field population

## Further Information

- [TailorDB Service](../../sdk/services/tailordb) - Complete TailorDB documentation
- [Schema Design Best Practices](../../sdk/services/tailordb#best-practices) - Tips for effective schema design
