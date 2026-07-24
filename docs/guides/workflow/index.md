---
doc_type: guide
---

# Workflow Service

## Overview

Workflow service enables you to build and execute complex, multi-step background jobs with automatic state management and resume capabilities on Tailor Platform.

If a workflow fails at any step, you can resume it from where it stopped without re-executing successful steps, making it ideal for long-running operations that need reliability.

With Workflow service, you can:

- Chain multiple JavaScript functions into durable workflows
- Automatically preserve execution state at each step
- Resume failed workflows from the point of failure
- Access TailorDB and other platform services with proper authentication
- Monitor execution progress through Tailor Console and tailor CLI

### Workflow vs Function

Both Workflow and Function services execute JavaScript code, but serve different purposes:

| Feature               | Function                       | Workflow                                      |
| --------------------- | ------------------------------ | --------------------------------------------- |
| **Execution model**   | Synchronous, single execution  | Multi-step, stateful execution                |
| **Duration**          | Short-lived (seconds)          | Long-running (minutes to hours)               |
| **State management**  | None                           | Automatic state preservation                  |
| **Resume capability** | No                             | Yes, from point of failure                    |
| **Use case**          | Data transformation, API calls | Complex background jobs, multi-step processes |
| **Called from**       | Pipeline resolvers, Executors  | Executors, Functions                          |

**When to use Workflow:**

- You need to chain multiple operations with state preservation
- The job may fail and needs to be resumed without repeating successful steps
- You're orchestrating complex business processes across multiple services

**When to use Function:**

- You need quick, synchronous data processing
- The operation is a single, atomic task
- You're transforming data within Pipeline resolvers

## How Workflow Execution Works

### Durable Execution Model

Workflow service uses a **durable execution model** where the execution state is automatically saved after each successful step.

**Example execution flow:**

```
Step 1: Fetch data from API    → Success ✓ (result cached)
Step 2: Transform data          → Success ✓ (result cached)
Step 3: Save to database        → Failed ✗
```

When you resume the workflow:

```
Step 1: Fetch data from API    → Skipped (use cached result)
Step 2: Transform data          → Skipped (use cached result)
Step 3: Save to database        → Retry from here
```

**Benefits:**

- **No duplicate work**: Successful steps are never re-executed
- **Safe retries**: You can retry as many times as needed
- **Cost efficient**: Only failed steps consume resources on retry
- **Data consistency**: Results from successful steps remain available

### Stack-Based Execution

Workflows support nested function calls, similar to regular programming:

```javascript
export function main(args) {
  // Call functions sequentially
  const data = tailor.workflow.startJobFunction("fetchData", {});
  const processed = tailor.workflow.startJobFunction("processData", data);
  return processed;
}
```

The execution stack:

```
[] → [main] → [main, fetchData] → [main] → [main, processData] → [main] → []
```

Each function's result is cached and passed to the next function in the chain.

Job functions within a single workflow execute **sequentially**, not in parallel. Each function completes before the next one starts. For concurrent execution, you can start multiple workflows asynchronously using `tailor.workflow.startWorkflow()`.

## Concurrency Control

In addition to the [platform-wide caps](/reference/platform/platform-limits#workflow-concurrency-limits) (50 per workspace, 20 per workflow), workflows can declare two independent concurrency policies. Neither rejects excess work, but they defer it in different ways: the workflow-level policy keeps new executions in `PENDING` at the scheduler, and the job function execution policy suspends the running workflow to `PENDING_RESUME` at dispatch time. Both resume automatically as slots free up.

### Workflow-level Concurrency Policy

Set `concurrencyPolicy.maxConcurrentExecutions` on the workflow definition to cap how many executions of the same workflow may run at once.

- Enforced by the **scheduler** when it picks up `PENDING` executions. Executions that would exceed the cap stay `PENDING` and are re-evaluated on the next scheduler tick.
- Scoped per workflow definition. Other workflows in the same workspace are unaffected.
- Applies to every entry point (`startWorkflow`, executor triggers, CLI `workflow start`) equally.

```typescript {{ title: 'workflows/import-orders.ts' }}
import { createWorkflow } from "@tailor-platform/sdk";
import { importOrders } from "./jobs/import-orders";

export default createWorkflow({
  name: "import-orders",
  mainJob: importOrders,
  concurrencyPolicy: {
    // At most 3 executions of `import-orders` run concurrently across the
    // workspace. The 4th trigger stays PENDING until one of the running
    // executions finishes.
    maxConcurrentExecutions: 3,
  },
});
```

See [Concurrency Policy](/sdk/services/workflow#concurrency-policy) in the SDK Workflow reference for the SDK API.

### Job Function Execution Policies

Declare workspace-scoped execution policies with a per-key `maxConcurrentExecutions` cap, then route job function dispatches through them by passing `executionPolicyKey` on `job.start()` / `tailor.workflow.startJobFunction()`.

- Enforced by the **runner** at dispatch time — a separate mechanism from the scheduler-level workflow cap above. The two stack: a workflow that is allowed to start can still have its job function dispatches suspended by an execution policy.
- Dispatches that would exceed the cap are suspended and resume automatically as slots free up.
- A dispatch without `executionPolicyKey` is unaffected by all declared policies, but still counts against the [platform workspace-wide job function limit](/reference/platform/platform-limits#workflow-job-function-concurrency-limits).
- User policies stack **on top of** the platform hard limits (workspace-wide 100 dispatches, per-key fallback 50 for policies without a user-defined cap). The most restrictive applicable cap wins.

**Declare policies and register them on the SDK config:**

```typescript {{ title: 'workflows/policies.ts' }}
import { defineWorkflowExecutionPolicies } from "@tailor-platform/sdk";

export const executionPolicies = defineWorkflowExecutionPolicies((define) => ({
  // Exact-key policy: one shared pool for dispatches keyed "premium".
  premium: define({ concurrencyPolicy: { maxConcurrentExecutions: 5 } }),
  // Wildcard policy: independent pool of size 3 per resolved key
  // (`tenant-api.acme`, `tenant-api.beta`, ...).
  tenantApi: define({
    name: "tenant-api",
    matchType: "prefix",
    concurrencyPolicy: { maxConcurrentExecutions: 3 },
  }),
}));
```

```typescript {{ title: 'tailor.config.ts' }}
import { defineConfig } from "@tailor-platform/sdk";
import { executionPolicies } from "./workflows/policies";

export default defineConfig({
  workflow: {
    files: ["workflows/**/*.ts"],
    executionPolicies,
  },
});
```

**Route a dispatch through a policy:**

```typescript {{ title: 'workflows/jobs/sync-tenant.ts' }}
import { createWorkflowJob } from "@tailor-platform/sdk";
import { executionPolicies } from "../policies";
import { syncOrders } from "./sync-orders";
import { pushMetrics } from "./push-metrics";

export const syncTenant = createWorkflowJob({
  name: "sync-tenant",
  body: async (input: { tenantId: string }) => {
    // Exact-key policy: pass `.key` directly (typed).
    await pushMetrics.start(
      { tenantId: input.tenantId },
      { executionPolicyKey: executionPolicies.premium.key },
    );

    // Wildcard policy: build the concrete key with `.keyFor(suffix)`.
    // Resolves to e.g. "tenant-api.acme"; each tenant gets its own pool of 3.
    await syncOrders.start(
      { tenantId: input.tenantId },
      { executionPolicyKey: executionPolicies.tenantApi.keyFor(input.tenantId) },
    );
  },
});
```

The same `executionPolicyKey` option is available on `tailor.workflow.startJobFunction(name, args, options)` when dispatching by name from a Function-service script.

**Matching modes:**

| Match type | Declaration | Applies to | Pool granularity |
| ------------------ | ---------------------------------------- | ------------------------------------------- | ---------------------------------------- |
| Exact (default)    | `matchType: "exact"` (or omitted)        | Dispatches whose key equals the policy key  | One pool shared by the exact key         |
| Prefix (wildcard)  | `matchType: "prefix"`                    | Dispatches whose key **starts with** the policy key | One independent pool **per resolved key** |

For wildcard policies, the platform registers the prefix with a trailing `*` and gives every concrete resolved key its own pool of the declared size. In the example above, `tenant-api` with `maxConcurrentExecutions: 3` allows **3 concurrent dispatches per tenant key** — `tenant-api.acme`, `tenant-api.beta`, and `tenant-api.gamma` each run up to 3 in parallel independently, not 3 across all of them combined.

**Overlapping policies stack (AND-of-caps).** When a dispatch key is covered by more than one policy (any mix of exact and wildcard prefixes), every covering policy applies — the dispatch acquires one slot in each matching pool, and any single saturated cap blocks it.

```typescript {{ title: 'workflows/policies.ts' }}
export const executionPolicies = defineWorkflowExecutionPolicies((define) => ({
  // Broad safety net: at most 100 dispatches under the "one" tree at once.
  one: define({
    name: "one",
    matchType: "prefix",
    concurrencyPolicy: { maxConcurrentExecutions: 100 },
  }),
  // Narrower cap for the "one.two" subtree.
  oneTwo: define({
    name: "one.two",
    matchType: "prefix",
    concurrencyPolicy: { maxConcurrentExecutions: 10 },
  }),
  // Even tighter cap for one exact key.
  oneTwoThree: define({
    name: "one.two.three",
    concurrencyPolicy: { maxConcurrentExecutions: 3 },
  }),
}));

// A dispatch with executionPolicyKey: "one.two.three" counts against all
// three pools simultaneously; the tightest cap (3) is what actually blocks.
// The broader `one*` and `one.two*` caps still guard the whole subtree, so a
// narrower policy cannot silently disable them.
```

See [Execution Policies](/sdk/services/workflow#execution-policies) in the SDK Workflow reference for the full declaration API, key grammar, and options for customizing `keyFor()`.
