# Setting up an Incoming Webhook Trigger

Incoming webhook triggers allow external services to invoke actions in your Tailor application via HTTP requests. In this tutorial, we'll create an executor that accepts project updates from external tools (like GitHub, Jira, or custom integrations) and updates project status in your application.

- To follow along with this tutorial, first complete the [SDK Quickstart](../../sdk/quickstart) and the [Data Schema Basics](../manage-data-schema/data-schema-basics) tutorial.

## Tutorial Steps

To create an incoming webhook trigger, you'll need to:

1. Configure the Executor service
2. Create the executor with an incoming webhook trigger
3. Deploy the changes
4. Verify the trigger by sending webhook requests

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

### 2. Create the Executor with Incoming Webhook Trigger

Create a new file `executor/webhook-update-project.ts`:

```typescript
import { createExecutor, incomingWebhookTrigger } from "@tailor-platform/sdk";
import { getDB } from "../generated/tailordb";

type WebhookPayload = {
  body: {
    projectId: string;
    status: string;
    description?: string;
  };
  headers: Record<string, string>;
};

export default createExecutor({
  name: "webhook-update-project",
  description: "Update project status via webhook from external tools",
  trigger: incomingWebhookTrigger<WebhookPayload>(),
  operation: {
    kind: "function",
    body: async ({ body, headers }) => {
      const db = getDB("main-db");

      // Validate the webhook payload
      if (!body.projectId || !body.status) {
        throw new Error("Missing required fields: projectId and status");
      }

      // Check if project exists
      const project = await db
        .selectFrom("Project")
        .selectAll()
        .where("id", "=", body.projectId)
        .executeTakeFirst();

      if (!project) {
        throw new Error(`Project not found: ${body.projectId}`);
      }

      // Update project status
      const updatedProject = await db
        .updateTable("Project")
        .set({
          status: body.status,
          description: body.description || project.description,
        })
        .where("id", "=", body.projectId)
        .returningAll()
        .executeTakeFirst();

      return {
        success: true,
        message: `Project ${updatedProject?.name} updated to ${body.status}`,
        projectId: updatedProject?.id,
      };
    },
  },
});
```

**Key Components:**

1. **Trigger**: `incomingWebhookTrigger<WebhookPayload>()` creates a webhook endpoint
   - Type parameter defines the expected payload structure
   - The trigger provides `body` and `headers` from the HTTP request

2. **Operation**: `function` executes custom TypeScript logic
   - Validates incoming payload
   - Checks if project exists
   - Updates project in the database
   - Returns success response

3. **Type Safety**: TypeScript types ensure payload structure is correct

**Payload Format:**

The webhook expects JSON payloads in this format:

```json
{
  "projectId": "project-uuid-here",
  "status": "completed",
  "description": "Updated project description (optional)"
}
```

You can also send form-urlencoded data, which will be automatically parsed into the `body` object.

### 3. Deploy the Changes

Deploy your application:

```bash
npm run deploy -- --workspace-id <your-workspace-id>
```

The SDK will create the incoming webhook endpoint for your executor.

### 4. Verify the Trigger

**Step 1: Get the webhook URL**

Open the [Console](https://console.tailor.tech) and navigate to your workspace. Select `Executors` and click on `webhook-update-project` to view the webhook URL.

The webhook URL format is:

```
https://api.erp.dev/v1/executor/workspaces/{WORKSPACE_ID}/executors/webhook-update-project/invokeIncomingWebhook/{WEBHOOK_SECRET}
```

Alternatively, use the Tailor CLI:

```bash
npx tailor-sdk executor webhook list
```

**Step 2: Create a test project**

First, create a project to update. In the GraphQL Playground:

```graphql
mutation {
  createProject(
    input: {
      name: "API Integration Test"
      description: "Testing webhook integration"
      status: "planning"
      createdAt: "2026-02-09T10:00:00Z"
      updatedAt: "2026-02-09T10:00:00Z"
    }
  ) {
    id
    name
    status
  }
}
```

Note the project ID returned.

**Step 3: Send a webhook request**

Send a POST request to update the project status:

```bash
curl -X POST "https://api.erp.dev/v1/executor/workspaces/{WORKSPACE_ID}/executors/webhook-update-project/invokeIncomingWebhook/{WEBHOOK_SECRET}" \
     -H "Content-Type: application/json" \
     -d '{
       "projectId": "<your-project-id>",
       "status": "active",
       "description": "Updated via webhook from external tool"
     }'
```

The webhook responds with `204 No Content`. The executor operation runs asynchronously after the response is sent.

You can also send form-urlencoded data:

```bash
curl -X POST "https://api.erp.dev/v1/executor/workspaces/{WORKSPACE_ID}/executors/webhook-update-project/invokeIncomingWebhook/{WEBHOOK_SECRET}" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "projectId=<your-project-id>&status=completed&description=Done"
```

**Step 4: Verify the update**

Open the GraphQL Playground and query the project:

```graphql
query {
  project(id: "<your-project-id>") {
    id
    name
    status
    description
    updatedAt
  }
}
```

You should see the updated status and description.

**Step 5: View executor logs**

In the Console, select the `Jobs` tab under your executor to see the execution history. Each webhook call creates a job entry with:

- Request payload
- Execution status
- Response data
- Any errors encountered

## Security Considerations

1. **Webhook Secret**: The URL includes a secret token for authentication
2. **Validation**: Always validate incoming payloads in your executor function
3. **Error Handling**: Return appropriate error messages for invalid requests
4. **Rate Limiting**: The platform automatically handles rate limiting

## Next Steps

Learn more about executors:

- [Executor Service](../../sdk/services/executor) - Complete executor documentation
- [Trigger Types](../../sdk/services/executor#trigger-types) - All available trigger types
- [Operation Types](../../sdk/services/executor#operation-types) - Different operation kinds
- [Event-based Triggers](event-based-trigger) - Create database event-driven executors
