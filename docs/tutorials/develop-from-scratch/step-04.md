# Step 4: Add Executor

Add an executor that sends a Slack notification whenever a Task is created.

[Source code on GitHub](https://github.com/tailor-platform/templates/tree/main/docs/build-from-scratch/sdk/step-04)

## Configuration Files

Only change from Step 3: added `executor` to `tailor.config.ts`.

```typescript {{title: 'tailor.config.ts'}}
import { defineAuth, defineConfig, definePlugins } from "@tailor-platform/sdk";
import { kyselyTypePlugin } from "@tailor-platform/sdk/plugin/kysely-type";
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
      admin: {
        attributes: { role: "ADMIN" },
      },
    },
  }),
  resolver: { "main-resolver": { files: [`./src/resolver/*.ts`] } },
  executor: { files: ["./src/executor/*.ts"] },
});

export const plugins = definePlugins(kyselyTypePlugin({ distPath: `./src/generated/tailordb.ts` }));
```

`createExecutor` takes an object config with `name`, `trigger`, and `operation`. The trigger `recordCreatedTrigger` takes `{ type: task }`. Available trigger context: `newRecord` (created), `oldRecord`/`newRecord` (updated), `oldRecord` (deleted).

```typescript {{title: 'src/executor/newTaskSlackNotification.ts'}}
import { createExecutor, recordCreatedTrigger } from "@tailor-platform/sdk";
import { task } from "../db/task";

export default createExecutor({
  name: "new-task-slack-notification",
  description: "Send Slack notification when a new task is created",
  trigger: recordCreatedTrigger({
    type: task,
  }),
  operation: {
    kind: "webhook",
    url: "https://hooks.slack.com/services/yourSlackWebhookURL",
    headers: {
      "Content-Type": "application/json",
    },
    requestBody: ({ newRecord }) => ({
      text: "New Task created :tada: " + newRecord.name,
    }),
  },
});
```

## File Tree

```
project-management/
├── package.json
├── tsconfig.json
├── tailor.config.ts
└── src/
    ├── common/permission.ts
    ├── db/
    │   ├── user.ts
    │   ├── project.ts
    │   └── task.ts
    ├── generated/tailordb.ts
    ├── resolver/closeProject.ts
    └── executor/
        └── newTaskSlackNotification.ts    # New
```

## Deploy

```bash
npm run generate
npm run deploy
```

## Verify

```graphql
mutation {
  createTask(
    input: {
      name: "Test notification"
      description: "Testing executor"
      projectId: "your-project-id"
      status: TODO
      dueDate: "2025-12-31"
    }
  ) {
    id
    name
  }
}
```

Check your Slack channel for the notification. If it doesn't appear, verify the webhook URL is correct and test it directly:

```bash
curl -X POST https://hooks.slack.com/services/YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message"}'
```

## Additional Resources

- [Executor Guide](/guides/executor/overview)
- [Webhook Triggers Documentation](/guides/executor/incoming-webhook-trigger)
