---
doc_type: guide
---

# Event-based Trigger

In this trigger, you can specify the type of event that initiates it (e.g., TailorDB data update, IdP user changes, authentication events, or workflow execution state transitions) and outline the specific conditions or criteria for its execution.

Refer [Supported Events](/guides/events) to learn about the different types of events supported in the Tailor Platform. Follow the [tutorial](/tutorials/setup-executor/event-based-trigger) for setup instructions.

## Basic Event-Based Trigger Configuration

The following example shows the basic structure of an event-based trigger using the SDK:

```typescript {{title:'executors/event-based-executor.ts'}}
import { createExecutor, recordCreatedTrigger } from "@tailor-platform/sdk";

export default createExecutor({
  name: "event-based-executor",
  description: "Execute operation based on an event",
  trigger: recordCreatedTrigger({
    type: Category,
    condition: ({ newRecord }) => !!newRecord.id,
  }),
  operation: {
    // Choose one of the operation types:
    // kind: "tailorGraphql", ...
    // kind: "webhook", ...
    // kind: "function", ...
    // kind: "jobFunction", ...
  },
});
```

## Event Data Access

Event-based triggers provide access to event-specific data through the `args` object. The available data depends on the event type.

`args.eventType` is available for all event types, indicating which specific event triggered the executor (e.g., `tailordb.type_record.created`). This is useful when an executor listens to multiple event types and needs to differentiate between them.

### TailorDB Events

- `args.eventType` - The type of event that occurred (e.g., `tailordb.type_record.created`)
- `args.namespaceName` - The namespace where the event occurred
- `args.typeName` - The type name of the record
- `args.newRecord` - The new/created record data (available for created and updated events)
- `args.oldRecord` - The previous record data (available for updated and deleted events)

### IdP Events

- `args.eventType` - The type of event that occurred (e.g., `idp.user.created`)
- `args.namespaceName` - The namespace where the event occurred
- `args.userId` - The ID of the affected IdP user

### Auth Events

- `args.eventType` - The type of event that occurred (e.g., `auth.access_token.issued`)
- `args.namespaceName` - The namespace where the event occurred

### Pipeline Events

- `args.eventType` - The type of event that occurred (e.g., `pipeline.resolver.executed`)
- `args.namespaceName` - The namespace where the event occurred
- `args.resolverName` - The name of the resolver
- `args.result` - The resolver execution result (on success)
- `args.error` - The error message (on failure)

### Workflow Execution Events

Workflow triggers expose the short event name on `args.event` for type narrowing, and the full event type on `args.rawEvent`. Workflows are not scoped to an application namespace, so these args carry no `args.namespaceName`.

- `args.event` - The short event name (`started`, `completed`, `retried`, `resumed`, `wait_started`, or `wait_resolved`)
- `args.rawEvent` - The full event type (e.g., `workflow.workflow_execution.completed`)
- `args.workflowId` - The ID of the workflow resource
- `args.workflowName` - The name of the workflow
- `args.workflowExecutionId` - The ID of the workflow execution
- `args.success` - Whether the execution succeeded (on `completed`)
- `args.error` - The error message (on `completed` when `args.success` is `false`)
- `args.retryCount` / `args.retryAfter` - The number of retries already attempted and the timestamp the retry is scheduled for (on `retried`)

Job-level triggers receive the same fields, with `args.event` narrowed to `started`, `completed`, `wait_started`, or `wait_resolved`, plus:

- `args.workflowJobExecutionId` - The ID of the job execution
- `args.jobFunctionName` - The name of the job, as passed to `createWorkflowJob`
- `args.stackedJobName` - The name identifying the job's position in the execution stack
- `args.waitKey` - The wait point key (on `wait_started` and `wait_resolved`)
- `args.waitPayload` - The JSON-serialized payload recorded with the wait point (on `wait_started`)

```typescript {{title:'executors/order-workflow-finished.ts'}}
import { createExecutor, workflowExecutionTrigger } from "@tailor-platform/sdk";
import orderWorkflow from "../workflows/order";

export default createExecutor({
  name: "order-workflow-finished",
  description: "Notify when the order workflow finishes",
  trigger: workflowExecutionTrigger({
    workflow: orderWorkflow,
    events: ["completed", "retried"],
  }),
  operation: {
    kind: "function",
    body: async (args) => {
      if (args.event === "completed" && !args.success) {
        console.error(args.error);
      }
    },
  },
});
```

Single-event helpers are also available: `workflowExecutionStartedTrigger()`, `workflowExecutionCompletedTrigger()`, `workflowExecutionRetriedTrigger()`, `workflowExecutionResumedTrigger()`, `workflowExecutionWaitStartedTrigger()`, and `workflowExecutionWaitResolvedTrigger()`, along with their `workflowJobExecution*` counterparts and the multi-event `workflowJobExecutionTrigger()`.

These triggers require the target resource to publish execution events, which `deploy` enables automatically. A `workflowExecution*` trigger enables it on the workflow it names, and a `workflowJobExecution*` trigger enables it on every job that workflow runs. Set `publishEvents` on the workflow or the job to override that. See [Execution Events](/guides/workflow/monitoring-executions#execution-events).

## Operation Types

For detailed operation properties, see the dedicated operation pages:

- [TailorGraphql Operation](tailor-graphql-operation)
- [Webhook Operation](webhook-operation)
- [Function Operation](function-operation)
- [Job Function Operation](job-function-operation)

## Related Documentation

- [Supported Events](/guides/events)
- [Event-based Trigger Tutorial](/tutorials/setup-executor/event-based-trigger)
