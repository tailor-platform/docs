---
doc_type: guide
---

# Triggering Workflow

Workflows can be triggered in production environments using two primary methods:

1. **Job Functions** - Trigger workflows programmatically from within another workflow's job function
2. **Executor** - Trigger workflows automatically based on events, webhooks, or schedules

## Job Functions (Programmatic)

You can start another workflow from within a job function using `tailor.workflow.triggerWorkflow()`. This is useful for workflow composition, parallel execution, and implementing multi-stage processes.

**Example:**

```javascript
export async function main(args) {
  // Start another workflow asynchronously
  const executionId = await tailor.workflow.triggerWorkflow(
    "notification-workflow",
    { orderId: args.orderId, email: args.customerEmail },
    {
      authInvoker: {
        namespace: "my-auth-namespace",
        machineUserName: "notification-bot",
      },
    },
  );

  console.log("Notification workflow started:", executionId);

  return {
    notificationExecutionId: executionId,
  };
}
```

**API Reference:**

- **First argument**: Name of the workflow to trigger
- **Second argument**: JSON string of input arguments
- **Third argument** (optional): Options object
  - `authInvoker` - Authentication context for the workflow
    - `namespace` - Auth namespace
    - `machineUserName` - Machine user name

**Return value:**

- Execution ID of the started workflow (string)

**Use cases:**

- Triggering notification workflows after main processing
- Starting parallel sub-workflows for different tasks
- Implementing workflow composition patterns

`triggerWorkflow()` starts a workflow asynchronously and returns immediately with an execution ID. It does not wait for the workflow to complete. Use this for fire-and-forget or parallel execution patterns.

## Executor (Event-Driven Automation)

Workflows can be triggered automatically from Executor service in response to events, webhooks, or schedules. This is the recommended approach for production automation.

**Event-Based Trigger**

Start a workflow when a database record is created:

```typescript {{ title: 'executor.ts' }}
import { createWorkflow, createExecutor, recordCreatedTrigger } from "@tailor-platform/sdk";
import { order } from "./types";

const processOrderWorkflow = createWorkflow({
  name: "process-order",
  steps: [
    /* ... */
  ],
});

createExecutor({
  name: "order-created-workflow",
  description: "Process order when created",
  trigger: recordCreatedTrigger({ type: order }),
  operation: {
    kind: "workflow",
    workflow: processOrderWorkflow,
    args: ({ newRecord }) => ({
      orderId: newRecord.id,
    }),
  },
});
```

**Webhook Trigger**

Start a workflow from an incoming webhook:

```typescript {{ title: 'executor.ts' }}
import { createWorkflow, createExecutor, webhookTrigger } from "@tailor-platform/sdk";

const processWebhookWorkflow = createWorkflow({
  name: "process-webhook",
  steps: [
    /* ... */
  ],
});

createExecutor({
  name: "webhook-workflow",
  description: "Process webhook data",
  trigger: webhookTrigger(),
  operation: {
    kind: "workflow",
    workflow: processWebhookWorkflow,
    args: ({ body }) => body,
  },
});
```

**Schedule-Based Trigger**

Start a workflow on a schedule:

```typescript {{ title: 'executor.ts' }}
import { createWorkflow, createExecutor, scheduleTrigger } from "@tailor-platform/sdk";

const dailySyncWorkflow = createWorkflow({
  name: "daily-sync",
  steps: [
    /* ... */
  ],
});

createExecutor({
  name: "daily-sync-workflow",
  description: "Daily data synchronization",
  trigger: scheduleTrigger({ cron: "0 2 * * *" }), // Every day at 2 AM
  operation: {
    kind: "workflow",
    workflow: dailySyncWorkflow,
    args: () => ({
      date: new Date().toISOString(),
    }),
  },
});
```

**Event-Based Trigger**

Start a workflow when a database record is created:

```ts {{ title: 'executor_workflow.tf' }}
resource "tailor_executor" "order_created_workflow" {
  workspace_id = tailor_workspace.main.id
  name         = "order-created-workflow"
  description  = "Process order when created"

  trigger = {
    event = {
      namespace = "tailordb"
      type      = "record.created"
      model     = "orders"
    }
  }

  operation = {
    workflow = {
      workflow_name = tailor_workflow.process_order.name
      invoker = {
        machine_user = {
          auth_namespace = tailor_auth.main_auth.namespace
          name           = tailor_auth_machine_user.workflow_bot.name
        }
      }
      variables = <<EOF
        ({ orderId: context.event.data.id })
      EOF
    }
  }
}
```

**Webhook Trigger**

Start a workflow from an incoming webhook:

```ts {{ title: 'executor_workflow.tf' }}
resource "tailor_executor" "webhook_workflow" {
  workspace_id = tailor_workspace.main.id
  name         = "webhook-workflow"
  description  = "Process webhook data"

  trigger = {
    webhook = {}
  }

  operation = {
    workflow = {
      workflow_name = tailor_workflow.process_webhook.name
      invoker = {
        machine_user = {
          auth_namespace = tailor_auth.main_auth.namespace
          name           = tailor_auth_machine_user.workflow_bot.name
        }
      }
      variables = <<EOF
        JSON.stringify(args.body)
      EOF
    }
  }
}
```

**Schedule-Based Trigger**

Start a workflow on a schedule:

```ts {{ title: 'executor_workflow.tf' }}
resource "tailor_executor" "daily_sync_workflow" {
  workspace_id = tailor_workspace.main.id
  name         = "daily-sync-workflow"
  description  = "Daily data synchronization"

  trigger = {
    schedule = {
      cron = "0 2 * * *"  # Every day at 2 AM
    }
  }

  operation = {
    workflow = {
      workflow_name = tailor_workflow.daily_sync.name
      invoker = {
        machine_user = {
          auth_namespace = tailor_auth.main_auth.namespace
          name           = tailor_auth_machine_user.workflow_bot.name
        }
      }
      variables = <<EOF
        ({ date: (new Date()).toISOString() })
      EOF
    }
  }
}
```

**Event-Based Trigger**

Start a workflow when a database record is created:

**Webhook Trigger**

Start a workflow from an incoming webhook:

**Schedule-Based Trigger**

Start a workflow on a schedule:

## Comparison and Use Cases

| Method            | Trigger Source  | Best For                                 | Authentication                    | Example Use Case                              |
| ----------------- | --------------- | ---------------------------------------- | --------------------------------- | --------------------------------------------- |
| **Job Functions** | Within workflow | Workflow composition, parallel execution | Configurable via `authInvoker`    | Main order processing → notification workflow |
| **Executor**      | External events | Automation, reactive systems             | Configured in executor definition | Database record created → process workflow    |

**When to use each method:**

**Job Functions:**

- You need to trigger a workflow as part of another workflow's logic
- Conditional triggering based on workflow results
- Parallel or sequential workflow orchestration
- Fire-and-forget notification patterns

**Executor:**

- Automated response to database events (create, update, delete)
- Processing incoming webhooks from external services
- Scheduled/periodic workflow execution (cron jobs)
- Event-driven microservices architecture

## Authentication

Both triggering methods support authentication through Machine Users:

**In Job Functions:**

```javascript
const executionId = await tailor.workflow.triggerWorkflow(
  "my-workflow",
  { data: "value" },
  {
    authInvoker: {
      namespace: "my-namespace",
      machineUserName: "workflow-bot",
    },
  },
);
```

**In Executor:**

```typescript
createExecutor({
  name: "my-executor",
  trigger: recordCreatedTrigger({ type: myType }),
  operation: {
    kind: "workflow",
    workflow: myWorkflow,
    args: ({ newRecord }) => ({
      data: newRecord.value,
    }),
  },
});
```

Note: In the SDK, authentication is handled through the `authInvoker` configuration in job functions or automatically through the executor configuration. The machine user must have appropriate permissions to execute the workflow and access any resources it requires.

## Starting Workflows

Start a workflow execution using the `tailor-sdk workflow start` command:

```bash
tailor-sdk workflow start my-workflow \
  --machineuser admin-machine-user \
  --arg '{"orderId": "12345"}'
```

The workflow name is specified as a positional argument (the first argument after `start`).

**Usage:**

```bash
tailor-sdk workflow start [options] <name>
```

**Arguments:**

- `<name>`: Workflow name (required)

**Options:**

- `--machineuser <MACHINEUSER>` (`-m`): Machine user name (required)
- `--arg <ARG>` (`-a`): Workflow argument as JSON string (optional)
- `--wait` (`-W`): Wait for execution to complete (optional)
- `--interval <INTERVAL>` (`-i`): Polling interval when using --wait (e.g., '3s', '500ms', '1m') (optional, default: '3s')
- `--logs` (`-l`): Display job execution logs after completion (requires --wait) (optional)

**Output:**

```
Execution ID: yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
Status: pending
```

### Passing Arguments

Pass input data to your workflow using the `--arg` option:

```bash
tailor-sdk workflow start my-workflow \
  --machineuser admin-machine-user \
  --arg '{"orderId": "12345", "priority": "high"}'
```

The argument is available in the main function as `args`:

```javascript
export function main(args) {
  console.log("Order ID:", args.orderId);
  console.log("Priority:", args.priority);
  // ...
}
```

### Authentication

Workflows execute with machine user authentication context.

**Machine User Authentication:**

```bash
tailor-sdk workflow start my-workflow \
  --machineuser my-machine-user \
  --arg '{"data": "value"}'
```

The workflow will execute with the permissions of the specified machine user, allowing access to protected resources. The `--machineuser` option is required when starting workflows.

## Further Information

- **Timeouts and Limits** - See [Data Retention](/administration/data-retention) for information about workflow execution timeouts and limits
- **Command Reference** - See [SDK Workflow Commands](/sdk/cli/workflow) for complete command documentation
