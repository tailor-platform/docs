---
doc_type: guide
---

# Monitoring Executions

## Check Execution Status

Use the `tailor-sdk workflow executions` command to check the status of a workflow execution:

```bash
tailor-sdk workflow executions <execution-id>
```

**With logs:**

```bash
tailor-sdk workflow executions <execution-id> --logs
```

**Usage:**

```bash
tailor-sdk workflow executions [options] [executionId]
```

**Arguments:**

- `[executionId]`: Execution ID (optional). If provided, shows execution details. If omitted, lists all executions.

**Options:**

- `--logs`: Display job execution logs (detail mode only)
- `--wait` (`-W`): Wait for execution to complete
- `--interval <INTERVAL>` (`-i`): Polling interval when using --wait (e.g., '3s', '500ms', '1m', default: '3s')
- `--workflow-name <WORKFLOW_NAME>` (`-n`): Filter by workflow name (list mode only)
- `--status <STATUS>` (`-s`): Filter by status (list mode only)
- `--json` (`-j`): Output as JSON

**Output:**

```
Execution ID: yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
Workflow ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Status: success
Started At: 2025-01-15T10:30:00Z
Finished At: 2025-01-15T10:30:45Z

Job Executions:
  1. main (success)
     Started: 2025-01-15T10:30:00Z
     Finished: 2025-01-15T10:30:45Z
     Stacked Task: main

  2. fetchData (success)
     Started: 2025-01-15T10:30:05Z
     Finished: 2025-01-15T10:30:15Z
     Stacked Task: main/fetchData

  3. processData (success)
     Started: 2025-01-15T10:30:20Z
     Finished: 2025-01-15T10:30:40Z
     Stacked Task: main/processData

Result: {
  "success": true,
  "processed": {...}
}
```

## List All Executions

List all workflow executions in your workspace:

```bash
tailor-sdk workflow executions
```

**Filter by workflow name:**

```bash
tailor-sdk workflow executions --workflow-name my-workflow
```

**Filter by status:**

```bash
tailor-sdk workflow executions --status RUNNING
```

**Combine filters:**

```bash
tailor-sdk workflow executions --workflow-name my-workflow --status FAILED
```

## Execution Status

A workflow execution can have the following statuses:

- **pending**: Waiting to be picked up by the scheduler
- **pending_resume**: Waiting to be resumed after a failure or resolve
- **running**: Currently executing
- **waiting**: Paused by `wait()`, waiting for an external `resolve()` signal (see [Wait / Resolve](/guides/workflow/wait-resolve))
- **success**: Completed successfully
- **failed**: Execution failed (can be resumed)

## Follow Execution Progress

You can follow an execution in real-time using the `--wait` flag:

```bash
tailor-sdk workflow executions <execution-id> --wait
```

This will poll for updates until the execution completes.

**Customize polling interval:**

```bash
tailor-sdk workflow executions <execution-id> --wait --interval 5s
```

**Wait and show logs:**

```bash
tailor-sdk workflow executions <execution-id> --wait --logs
```

The `start` command returns an execution ID that you can use with `workflow executions` to monitor progress.

## Execution Events

Besides polling, a workflow can publish its execution lifecycle as platform events, so that an executor reacts to each state transition as it happens. Refer to [Workflow events](/guides/events#workflow) for the event catalog and payloads.

Publishing is controlled per resource by `publishEvents`, and you normally do not have to set it. When an executor subscribes to a workflow's execution events, `deploy` enables publishing automatically on the resources that produce them:

- A `workflowExecution*` trigger enables it on the workflow it names, which publishes the `workflow.workflow_execution.*` events.
- A `workflowJobExecution*` trigger enables it on every job the named workflow runs, which publishes the `workflow.workflow_execution.job_execution.*` events.

Set `publishEvents` explicitly to override that. Use `true` to publish workflow-level events without a subscribing executor:

```typescript {{ title: 'workflows/order-processing.ts' }}
import { createWorkflow } from "@tailor-platform/sdk";
import { processOrder } from "./jobs/process-order";

export default createWorkflow({
  name: "order-processing",
  mainJob: processOrder,
  publishEvents: true,
});
```

A job takes the same field for its own execution events:

```typescript {{ title: 'workflows/jobs/process-order.ts' }}
import { createWorkflowJob } from "@tailor-platform/sdk";

export const processOrder = createWorkflowJob({
  name: "process-order",
  publishEvents: true,
  body: async () => ({ processed: true }),
});
```

Use `false` to keep publishing off. `deploy` fails if an executor subscribes to events that the value opts out of, so a subscription cannot silently go unfulfilled.

To consume these events, configure an executor with a workflow execution trigger. See [Event-based Trigger](/guides/executor/event-based-trigger#workflow-execution-events).

## Monitoring in Tailor Console

You can also monitor workflow executions through the [Tailor Console](https://console.tailor.tech) web interface.

The console provides:

- Visual execution timeline
- Job function execution details
- Error messages and logs
- Execution history for all workflow runs

## Resume and Retry

### Resuming Failed Workflows

If a workflow execution fails, you can resume it from the point of failure using the `resume` command:

```bash
tailor-sdk workflow resume <execution-id>
```

**Usage:**

```bash
tailor-sdk workflow resume [options] <executionId>
```

**Arguments:**

- `<executionId>`: Failed execution ID (required)

**Options:**

- `--wait` (`-W`): Wait for execution to complete
- `--interval <INTERVAL>` (`-i`): Polling interval when using --wait (e.g., '3s', '500ms', '1m', default: '3s')
- `--logs` (`-l`): Display job execution logs after completion (requires --wait)
- `--json` (`-j`): Output as JSON

**Resume and wait for completion:**

```bash
tailor-sdk workflow resume <execution-id> --wait
```

**Resume and show logs:**

```bash
tailor-sdk workflow resume <execution-id> --wait --logs
```

**What happens during resume:**

1. The system retrieves all successful job function results from the previous run
2. The workflow restarts from the main function
3. Successful job functions are skipped (their cached results are used)
4. Failed or not-yet-executed job functions are executed

**Example:**

Original execution:

```
fetchData    → Success ✓
processData  → Success ✓
saveToDb     → Failed ✗
```

After resume:

```
fetchData    → Skipped (cached)
processData  → Skipped (cached)
saveToDb     → Executed again
```

### Resuming from Code

You can also resume a failed or pending-retry execution from your own code (a workflow job function, an executor, or a pipeline resolver) using `tailor.workflow.resumeWorkflow()`. This lets you build self-healing flows that recover from transient failures automatically, without an operator running `tailor-sdk workflow resume` or using the Tailor Console.

**Example:**

```javascript
export async function main(args) {
  const resumedId = await tailor.workflow.resumeWorkflow(args.executionId);
  console.log("Resumed execution:", resumedId);
  return { resumedExecutionId: resumedId };
}
```

**API Reference:**

- **First argument**: Execution ID of a failed or pending-retry execution (string)

**Return value:**

- Execution ID of the resumed execution (string)

`resumeWorkflow()` behaves like the `resume` command described above. The workflow restarts from the main function and reuses the cached results of successful job functions, so only failed or not-yet-executed jobs run again. It rejects with an error whose message is prefixed with `resumeWorkflow failed:` when the execution cannot be resumed. Let that error propagate to fail the calling execution, and add a `try`/`catch` only when you need to control the error or its message.

### When to Use Resume

Resume is useful when:

- External API calls fail temporarily
- Database connections time out
- Rate limits are hit
- Any transient error occurs

**Important:** Only resume when the failure is transient. If the failure is due to invalid data or logic errors, fix the issue and create a new execution instead.

### Idempotency Best Practices

Design your job functions to be idempotent (safe to execute multiple times):

**Good - Idempotent:**

```javascript
export async function main(args) {
  // Check if record already exists
  const existing = await checkRecord(args.id);
  if (existing) {
    console.log("Record already exists, skipping");
    return existing;
  }

  // Create only if not exists
  return await createRecord(args);
}
```

**Avoid - Not Idempotent:**

```javascript
export function main(args) {
  // This will create duplicate records on retry
  return createRecord(args);
}
```

**Tips for idempotency:**

- Check for existing records before creating
- Use unique identifiers (UUIDs, order IDs, etc.)
- Design operations to be repeatable
- Use database constraints to prevent duplicates

## Testing and Development

### Creating Workflows with SDK

Workflows are created and managed using the Tailor Platform SDK. Define workflows in your code using `createWorkflow`:

```typescript
import { createWorkflow } from "@tailor-platform/sdk";

export const myWorkflow = createWorkflow({
  name: "my-workflow",
  steps: [
    // Define your workflow steps
  ],
});
```

After defining your workflow, deploy it using:

```bash
tailor-sdk deploy
```
