---
doc_type: guide
---

# Workflow Operation

The Workflow operation enables triggering workflows from the Executor service. This operation type is ideal for automatically starting workflows in response to events, webhooks, or scheduled tasks.

For more details on workflows, refer to the [Workflow Service](/guides/workflow/) documentation.

## Configuration Example

```typescript {{ title: 'executor.ts' }}
import { createWorkflow, createExecutor } from "@tailor-platform/sdk";
import { order } from "./types";

const processOrderWorkflow = createWorkflow({
  name: "process-order",
  steps: [
    // workflow steps...
  ],
});

createExecutor({
  name: "workflow-executor",
  description: "Trigger workflow execution",
  // Choose one of the trigger types:
  // trigger: recordCreatedTrigger({ type: order }),
  // trigger: webhookTrigger(),
  // trigger: scheduleTrigger({ cron: "0 * * * *" }),
  operation: {
    kind: "workflow",
    workflow: processOrderWorkflow,
    args: ({ newRecord }) => ({
      orderId: newRecord.id,
      timestamp: new Date().toISOString(),
    }),
  },
});
```

## Properties

**Executor Properties**

| Property      | Type   | Required | Description                                                                                                                                 |
| ------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | string | Yes      | The name of the executor. The name field has the validation rule `^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$`, and it does not allow capital letters |
| `description` | string | No       | The description of the executor                                                                                                             |
| `trigger`     | object | Yes      | The type of trigger (e.g., `recordCreatedTrigger`, `webhookTrigger`, `scheduleTrigger`)                                                     |

**Workflow Operation Properties**

| Property   | Type         | Required | Description                                                                                                              |
| ---------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `kind`     | `"workflow"` | Yes      | Specifies this is a workflow operation                                                                                   |
| `workflow` | Workflow     | Yes      | The workflow to trigger (created with `createWorkflow()`)                                                                |
| `args`     | function     | No       | A function that returns the arguments to pass to the workflow. Receives trigger context (e.g., `newRecord`, `oldRecord`) |

**Executor Properties**

| Property       | Type   | Required | Description                                                                                                                                 |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | string | Yes      | The name of the executor. The name field has the validation rule `^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$`, and it does not allow capital letters |
| `workspace_id` | string | Yes      | The ID of the workspace that the executor namespace belongs to                                                                              |
| `description`  | string | No       | The description of the executor                                                                                                             |
| `trigger`      | object | Yes      | The type of trigger (webhook, event, or schedule)                                                                                           |

**Workflow Operation Properties**

| Property        | Type   | Supports Scripting                                                              | Required | Description                                                                               |
| --------------- | ------ | ------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `workflow_name` | string | -                                                                               | Yes      | The name of the workflow to trigger                                                       |
| `invoker`       | object | -                                                                               | No       | The invoker of the operation                                                              |
| `variables`     | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | No       | The variables to pass to the workflow. Can access trigger-specific data via `args` object |

Learn more about executor properties in the [Tailor Platform Provider documentation](https://registry.terraform.io/providers/tailor-platform/tailor/latest/docs/resources/executor).

**Executor Properties**

| Property      | Type   | Required | Description                                                                                                                                 |
| ------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Name`        | string | Yes      | The name of the executor. The name field has the validation rule `^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$`, and it does not allow capital letters |
| `Description` | string | No       | The description of the executor                                                                                                             |
| `Trigger`     | object | Yes      | The type of trigger (e.g., #TriggerIncomingWebhook, #TriggerEvent, #TriggerSchedule)                                                        |

**TargetWorkflow Properties**

| Property       | Type   | Supports Scripting                                                              | Required | Description                                                                               |
| -------------- | ------ | ------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `WorkflowName` | string | -                                                                               | Yes      | The name of the workflow to trigger                                                       |
| `Invoker`      | object | -                                                                               | No       | The invoker of the operation                                                              |
| `Variables`    | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | No       | The variables to pass to the workflow. Can access trigger-specific data via `args` object |

## Use Cases

Workflow operations are ideal for:

- **Event-driven automation**: Automatically trigger workflows when database records are created, updated, or deleted
- **Webhook processing**: Start workflows in response to external webhooks from third-party services
- **Scheduled workflows**: Execute workflows on a regular schedule (e.g., daily reports, periodic data synchronization)
- **Microservices orchestration**: Coordinate complex business processes across multiple services
- **Long-running processes**: Handle tasks that require multiple steps or extended processing time
- **Asynchronous task processing**: Trigger workflows for background processing without blocking the main request

## Related Documentation

- [Workflow Service Overview](/guides/workflow/)
- [Creating Workflows](/guides/workflow/creating-workflows)
- [Triggering Workflows](/guides/workflow/triggering-workflow)
- [Monitoring Executions](/guides/workflow/monitoring-executions)
- [Event-Based Trigger](/guides/executor/event-based-trigger)
- [Incoming Webhook Trigger](/guides/executor/incoming-webhook-trigger)
- [Schedule-Based Trigger](/guides/executor/schedule-based-trigger)
