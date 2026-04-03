---
doc_type: guide
---

# Executor Service

The Executor Service offers a robust and integrated solution for automating tasks and managing workflows across the platform's core services.

## Quick Start with SDK

Create event-driven handlers with TypeScript:

```typescript
import { createExecutor, recordCreatedTrigger } from "@tailor-platform/sdk";
import { user } from "../tailordb/user";

export default createExecutor({
  name: "user-welcome",
  description: "Send welcome email to new users",
  trigger: recordCreatedTrigger({
    type: user,
    condition: ({ newRecord }) => !!newRecord.email && newRecord.isActive,
  }),
  operation: {
    kind: "function",
    body: async ({ newRecord }) => {
      // Send welcome email logic here
      console.log(`Welcome ${newRecord.email}!`);
    },
  },
});
```

### Schedule-based Trigger

```typescript
import { createExecutor, scheduleTrigger } from "@tailor-platform/sdk";

export default createExecutor({
  name: "daily-cleanup",
  trigger: scheduleTrigger({ cron: "0 0 * * *" }), // Every day at midnight
  operation: {
    kind: "function",
    body: async () => {
      // Cleanup logic
    },
  },
});
```

### Webhook Trigger

```typescript
import { createExecutor, incomingWebhookTrigger } from "@tailor-platform/sdk";

interface WebhookPayload {
  body: { event: string; data: unknown };
  headers: Record<string, string>;
}

export default createExecutor({
  name: "external-webhook",
  trigger: incomingWebhookTrigger<WebhookPayload>(),
  operation: {
    kind: "function",
    body: async ({ body, headers }) => {
      console.log(`Received event: ${body.event}`);
    },
  },
});
```

## Overview

Executors consist of two main properties:

1. `trigger`: defines when the execution should happen.

1. `operation`: defines what action should be performed.

## Trigger

The `Trigger` property defines the conditions under which the Executor service initiates an action. It specifies the event type and condition that must be met for the action to be triggered.

You can configure the following three types of triggers to execute the user defined tasks.

1. [Event-based trigger](event-based-trigger)

1. [Incoming webhook trigger](incoming-webhook-trigger)

1. [Schedule-based trigger](schedule-based-trigger)

## Operation

The `operation` property defines the action to be executed when the Trigger condition is met. You can describe the specific task or operation to be performed, such as querying TailorDB, sending notifications, or triggering workflows.
There are five types of targets:

1. [TailorGraphql](tailor-graphql-operation)

This involves interaction with the TailorDB and performs operations such as querying data or making changes (mutations).

2. [Webhook](webhook-operation)

With this type of operation, you can send a HTTP request from your executor service. Currently we only support POST method.

3. [Function](function-operation)

This operation type executes JavaScript/TypeScript code synchronously via the Function Service. Functions return results directly and are ideal for custom business logic, data transformations, and API integrations.

4. [Job Function](job-function-operation)

This operation type executes JavaScript/TypeScript code asynchronously via the Function Service. Job functions are typically used for asynchronous task processing, long-running operations, and background processing.

5. [Workflow](workflow-operation)

This operation type triggers workflow executions from the Executor service. Workflows are ideal for complex, multi-step processes and long-running orchestrations that need to be triggered by events, webhooks, or schedules.

Each Trigger can be configured with the above five target types, providing fifteen ways to configure them.

## Timeouts

Both operations `TailorGraphql` and `Webhook` have a timeout set to 60 seconds. If the process exceeds this limit, it is considered a failure, and a retry will be triggered (up to a maximum of 10 attempts).

You can view the number of attempts for each job created for an executor in the [Tailor Console](https://console.tailor.tech).

For more details on the number of attempts, refer to the [Verify the trigger](/tutorials/setup-executor/event-based-trigger#5verifythetrigger) section of the event-based trigger tutorial.

Additionally, executor operations are subject to a recursive call depth limit of 10 levels when triggering other platform services. See [Platform Limits](/reference/platform/platform-limits#recursive-call-detection) for more details.
