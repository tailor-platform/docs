---
description: "Create an executor that runs on a cron schedule to generate a daily project status report."
---

# Setting up a Schedule-based Trigger

Schedule-based triggers allow you to automatically run actions at predefined intervals using cron expressions. In this tutorial, we'll create an executor that generates a daily project status report.

- To follow along with this tutorial, first complete the [SDK Quickstart](../../sdk/quickstart) and the [Data Schema Basics](../manage-data-schema/data-schema-basics) tutorial.

## Tutorial Steps

To create a schedule-based trigger, you'll need to:

1. Configure the Executor service
2. Create the executor with a schedule trigger
3. Deploy the changes
4. Verify the trigger

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

### 2. Create the Executor with Schedule Trigger

Create a new file `executor/daily-project-report.ts`:

```typescript
import { createExecutor, scheduleTrigger } from "@tailor-platform/sdk";
import { getDB } from "../generated/tailordb";

export default createExecutor({
  name: "daily-project-report",
  description: "Generate daily project status report and send to Slack",
  trigger: scheduleTrigger({
    cron: "0 9 * * *", // Every day at 9:00 AM
    timezone: "America/New_York",
  }),
  operation: {
    kind: "webhook",
    url: () => "https://hooks.slack.com/services/YOUR_WEBHOOK_URL",
    headers: {
      "Content-Type": "application/json",
    },
    requestBody: async () => {
      const db = getDB("main-db");

      // Get all active projects
      const activeProjects = await db
        .selectFrom("Project")
        .selectAll()
        .where("status", "in", ["planning", "active"])
        .execute();

      // Count tasks by status for each project
      const projectSummaries = await Promise.all(
        activeProjects.map(async (project) => {
          const taskStats = await db
            .selectFrom("Task")
            .select(({ fn }) => [
              fn.count<number>("id").as("total"),
              fn.countAll<number>().filterWhere("status", "=", "DONE").as("completed"),
              fn.countAll<number>().filterWhere("status", "=", "TODO").as("todo"),
              fn.countAll<number>().filterWhere("status", "=", "IN_PROGRESS").as("inProgress"),
            ])
            .where("projectId", "=", project.id)
            .executeTakeFirst();

          return {
            name: project.name,
            status: project.status,
            stats: taskStats,
          };
        }),
      );

      // Format Slack message
      const projectBlocks = projectSummaries.map((p) => ({
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            `*${p.name}* (${p.status})\n` +
            `Tasks: ${p.stats?.completed}/${p.stats?.total} completed | ` +
            `${p.stats?.inProgress} in progress | ${p.stats?.todo} todo`,
        },
      }));

      return {
        text: "Daily Project Status Report",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "📊 Daily Project Status Report",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Report generated: ${new Date().toLocaleDateString()}`,
            },
          },
          { type: "divider" },
          ...projectBlocks,
        ],
      };
    },
  },
});
```

**Key Components:**

1. **Trigger**: `scheduleTrigger()` runs the executor on a schedule
   - `cron`: Cron expression defining when to run (9 AM daily in this example)
   - `timezone`: Timezone for the schedule (optional, defaults to UTC)

2. **Cron Expression Format**: `minute hour day month day-of-week`
   - `0 9 * * *` = Every day at 9:00 AM
   - `*/5 * * * *` = Every 5 minutes
   - `0 */2 * * *` = Every 2 hours
   - `0 9 * * 1` = Every Monday at 9:00 AM
   - `0 0 1 * *` = First day of every month at midnight

3. **Operation**: Queries all active projects and their task statistics, then sends a formatted report to Slack

4. **Database Queries**: Uses Kysely to aggregate task data for each project

### 3. Deploy the Changes

Before deploying, make sure you have:

1. Created a Slack webhook URL (see [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks))
2. Replaced `YOUR_WEBHOOK_URL` in the executor code with your actual webhook URL
3. Generated Kysely types: `npm run generate` (if using Kysely type generator)

Deploy your application:

```bash
npm run deploy -- --workspace-id <your-workspace-id>
```

The SDK will deploy the executor with the schedule configuration.

### 4. Verify the Trigger

Open the [Console](https://console.tailor.tech) and navigate to your workspace. Select `Executors` to view the created executor.

**Understanding Schedule Execution:**

Scheduled executors:

- Run automatically according to the cron expression
- Execute in the specified timezone
- Appear in the Jobs tab after each execution
- Can be manually triggered from the Console for testing

**Test the Executor:**

While the executor will run automatically according to the schedule, you can test it immediately:

1. **Manually trigger the executor**: In the Console, find your executor and click "Run Now" to execute it immediately

2. **Check Slack**: Verify that the daily report appears in your Slack channel with project summaries

3. **View execution logs**: Select the `Jobs` tab to see execution history

**Troubleshooting:**

- **No notification received**: Check the Slack webhook URL and test it manually with curl
- **Error in logs**: Review the executor logs in the Console for detailed error messages

## Next Steps

Learn more about executors:

- [Executor Service](../../sdk/services/executor) - Complete executor documentation
- [Schedule Triggers](../../sdk/services/executor#schedule-trigger) - Detailed cron configuration
- [Operation Types](../../sdk/services/executor#operation-types) - Different operation kinds
- [Event-based Triggers](event-based-trigger) - React to database changes
