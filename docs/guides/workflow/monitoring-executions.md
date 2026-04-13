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
tailor-sdk apply
```
