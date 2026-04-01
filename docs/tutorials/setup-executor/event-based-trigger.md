# Setting up an Event-based Trigger

Event-based triggers allow you to automatically run actions when specific database events occur. In this tutorial, we'll create an executor that sends a Slack notification when a Project's status changes to "COMPLETED".

- To follow along with this tutorial, first complete the [SDK Quickstart](../../sdk/quickstart) and the [Data Schema Basics](../manage-data-schema/data-schema-basics) tutorial.

## Tutorial Steps

To create an event-based trigger, you'll need to:

1. Configure the Executor service
2. Create the executor with a record updated trigger
3. Enable `publishEvents` feature on the Project type
4. Deploy the changes
5. Verify the trigger

### 1. Configure the Executor Service

Update your `tailor.config.ts` to include the executor service:

```typescript
import { defineConfig } from "@tailor-platform/sdk";

export default defineConfig({
  name: "project-management",
  db: {
    "main-db": {
      files: ["db/**/*.ts"],
    },
  },
  executor: {
    files: ["executor/**/*.ts"],
  },
});
```

This configures the SDK to load executor definitions from the `executor/` directory.

### 2. Create the Executor with Record Updated Trigger

Create a new file `executor/notify-project-completion.ts`:

```typescript
import { createExecutor, recordUpdatedTrigger } from "@tailor-platform/sdk";
import { project } from "../db/project";
import { getDB } from "../generated/tailordb";

export default createExecutor({
  name: "notify-project-completion",
  description: "Send Slack notification when project is completed",
  trigger: recordUpdatedTrigger({
    type: project,
    condition: ({ newRecord, oldRecord }) =>
      newRecord.status === "COMPLETED" && oldRecord.status !== "COMPLETED",
  }),
  operation: {
    kind: "webhook",
    url: () => "https://hooks.slack.com/services/YOUR_WEBHOOK_URL",
    headers: {
      "Content-Type": "application/json",
    },
    requestBody: async ({ newRecord }) => {
      const db = getDB("main-db");

      // Count tasks for summary
      const taskStats = await db
        .selectFrom("Task")
        .select(({ fn }) => [
          fn.count<number>("id").as("total"),
          fn.countAll<number>().filterWhere("status", "=", "DONE").as("completed"),
        ])
        .where("projectId", "=", newRecord.id)
        .executeTakeFirst();

      return {
        text: `🎉 Project Completed: ${newRecord.name}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Project:* ${newRecord.name}\n*Status:* ${newRecord.status}\n*Tasks:* ${taskStats?.completed}/${taskStats?.total} completed`,
            },
          },
        ],
      };
    },
  },
});
```

**Key Components:**

1. **Trigger**: `recordUpdatedTrigger()` fires when a Project record is updated
   - `type: project`: Specifies which type to monitor
   - `condition`: Only triggers when status changes TO "COMPLETED" (not already completed)

2. **Operation**: `webhook` sends HTTP POST request to Slack
   - `url`: Your Slack webhook URL (replace with actual URL from Slack)
   - `requestBody`: Constructs the Slack message with project details and task statistics

3. **Database Query**: Uses Kysely to query task completion statistics before sending the notification

### 3. Enable `publishEvents` Feature

To ensure the executor triggers when Project records are updated, enable `publishEvents` in your Project type definition.

Update your `db/project.ts` file:

```typescript
import { db } from "@tailor-platform/sdk";

export const project = db
  .type("Project", {
    name: db.string().description("Project name"),
    description: db.string().optional().description("Project description"),
    status: db
      .enum(["planning", "active", "completed", "archived"])
      .description("Current project status"),
    startDate: db.string().optional().description("Project start date"),
    endDate: db.string().optional().description("Project end date"),
    createdAt: db.string().description("Creation timestamp"),
    updatedAt: db.string().description("Last update timestamp"),
  })
  .features({
    publishEvents: true,
  });
```

The `.features({ publishEvents: true })` configuration enables the platform to publish events when Project records are created, updated, or deleted. Without this feature enabled, the executor trigger will not fire.

### 4. Deploy the Changes

Before deploying, make sure you have:

1. Created a Slack webhook URL (see [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks))
2. Replaced `YOUR_WEBHOOK_URL` in the executor code with your actual webhook URL

Generate Kysely types for type-safe database access:

```bash
npm run generate
```

This generates TypeScript types and the `getDB()` helper in the `generated/` directory.

Deploy your application:

```bash
npm run deploy -- --workspace-id <your-workspace-id>
```

The SDK will deploy both the updated Project type with `publishEvents` enabled and the new executor.

### 5. Verify the Trigger

Open the [Console](https://console.tailor.tech) and navigate to your workspace. Select `Executors` to view the created executor.

**Test the Executor:**

1. **Create a test project**: In the GraphQL Playground, create a project with some tasks:

```graphql
mutation {
  createProject(
    input: {
      name: "Website Redesign"
      description: "Complete redesign of company website"
      status: "active"
      createdAt: "2026-02-09T10:00:00Z"
      updatedAt: "2026-02-09T10:00:00Z"
    }
  ) {
    id
  }
}
```

2. **Create some tasks** for the project (use the project ID from above):

```graphql
mutation {
  createTask(
    input: {
      title: "Design homepage"
      projectId: "<project-id>"
      status: "DONE"
      createdAt: "2026-02-09T10:00:00Z"
      updatedAt: "2026-02-09T10:00:00Z"
    }
  ) {
    id
  }
}
```

3. **Update the project status to COMPLETED**:

```graphql
mutation {
  updateProject(
    id: "<project-id>"
    input: { status: "COMPLETED", updatedAt: "2026-02-09T11:00:00Z" }
  ) {
    id
    status
  }
}
```

4. **Check Slack**: You should receive a notification in your Slack channel with the project name and task completion statistics.

5. **View executor logs**: In the Console, select the `Jobs` tab to see the executor execution history.

![Tailor Console Executor Jobs](../assets/tutorials-console-eventbased-executor-jobs.png)

Clicking `View Attempts` displays details of job execution attempts. The Tailor Platform automatically retries failed webhook calls (non-2xx status codes), except for configuration or script errors.

**Troubleshooting:**

- **No notification received**: Verify your Slack webhook URL is correct
- **Executor not triggering**: Ensure `publishEvents: true` is set in `.features()` on the Project type
- **Error in logs**: Check the executor logs in the Console for detailed error messages

## Next Steps

Learn more about executors:

- [Executor Service](../../sdk/services/executor) - Complete executor documentation
- [Trigger Types](../../sdk/services/executor#trigger-types) - All available trigger types
- [Operation Types](../../sdk/services/executor#operation-types) - Different operation kinds
- [Schedule Triggers](schedule-based-trigger) - Create cron-based executors
