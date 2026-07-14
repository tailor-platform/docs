# Platform Limits

This page documents the various limits and constraints in the Tailor Platform services. Understanding these limits is essential for building robust applications that operate within platform boundaries.

## Overview

Platform limits are enforced across different services in the Tailor Platform to ensure system stability, resource management, and prevent excessive resource consumption. Each service has specific limits based on its intended use case and operational requirements.

## Service Limits

| Service              | Limit Type                      | Limit Value   | Description                                                                     | Impact                                                                                  |
| -------------------- | ------------------------------- | ------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Recursive Call Limit | Call Depth                      | 10 levels     | Max depth for nested platform-to-platform requests (pipelines, functions, etc.) | Request rejected with BadRequest error if depth exceeds 10 levels                       |
| Workflow             | Workspace Concurrent Executions | 50 executions | Max concurrent workflow executions per workspace                                | Pending executions remain in `PENDING` status until running executions drop below the cap |
| Workflow             | Per-Workflow Concurrent Executions | 20 executions | Max concurrent executions of a single workflow                                  | Pending executions remain in `PENDING` status until running executions drop below the cap |
| Workflow             | Workspace Concurrent Job Functions | 100 dispatches | Max concurrent job function dispatches per workspace (regardless of `executionPolicyKey`) | Dispatch is suspended and workflow moves to `PENDING_RESUME` until dispatches drop below the cap |
| Workflow             | Per-Key Concurrent Job Functions (fallback) | 50 dispatches | Platform fallback per `executionPolicyKey`, applied only when a matching execution policy has no user-defined `concurrencyPolicy.maxConcurrentExecutions` | Dispatch is suspended and workflow moves to `PENDING_RESUME` until dispatches drop below the cap |
| Executor             | Workspace Concurrent Job Function Operations | 100 executions | Max concurrently running job function operations per workspace                 | Excess executions remain pending and start automatically, oldest first, as running executions complete |
| Function             | Memory                          | 32 MB         | Max memory available to a Function execution                                    | Execution terminated with `Memory limit exceeded` error if usage exceeds 32 MB          |
| JobFunction          | Memory                          | 256 MB        | Max memory available to a JobFunction execution                                 | Execution terminated with `Memory limit exceeded` error if usage exceeds 256 MB         |
| Function             | TailorDB Select Result Size     | 128 MB        | Max size of data returned from a TailorDB select query                          | Query fails if the result set exceeds 128 MB                                            |
| Function             | Fetch Response Body Size        | 10 MB         | Max size of a response body when using buffered methods like `.text()` or `.json()` | Request fails if the response body exceeds 10 MB                                            |

## Recursive Call Detection

The Tailor Platform implements recursive call detection to prevent infinite loops and excessive resource consumption when services call each other. This safety mechanism tracks the depth of nested platform-to-platform requests and enforces a maximum depth limit.

### Affected Operations

Recursive call detection applies to:

- **Pipeline resolvers** calling other pipeline resolvers
- **Function service** operations that trigger other platform services
- **Executor service** operations that invoke GraphQL mutations or other services
- **Event-driven workflows** where one service triggers events that cause other services to execute

### Common Scenarios

This limit prevents issues in scenarios such as:

- Pipeline A calls Pipeline B, which calls Pipeline C, and so on beyond 10 levels
- Function operations that recursively trigger other functions through events
- Executor workflows that create cascading service calls
- Event loops where service operations trigger events that cause the same operations to execute again

## Workflow Concurrency Limits

The Tailor Platform enforces concurrency limits on workflow executions at the scheduler level to prevent resource exhaustion and ensure fair scheduling across workspaces.

### How It Works

Two independent limits control the number of concurrent workflow executions:

- **Workspace-wide limit (50)**: Caps the total number of concurrently running workflow executions within a single workspace. This prevents any one workspace from monopolizing platform resources.
- **Per-workflow limit (20)**: Caps the number of concurrently running executions of the same workflow definition. This prevents a single high-volume workflow from starving other workflows in the workspace.

When either limit is reached, new executions are not rejected. Instead, they remain in `PENDING` status and are re-evaluated on the next scheduler polling tick. Once running executions complete and slots become available, pending executions are transitioned to `RUNNING` automatically.

### Behavior

- Both limits are enforced independently. An execution must satisfy both limits to start running.
- If the workspace-wide limit is reached, no new executions start in that workspace regardless of per-workflow counts.
- If the per-workflow limit is reached for a specific workflow, other workflows in the same workspace can still start new executions (as long as the workspace-wide limit is not reached).

## Workflow Job Function Concurrency Limits

Separately from the scheduler-level workflow caps above, the workflow runner enforces platform hard limits on individual job function dispatches. These apply on top of any [user-declared execution policies](/guides/workflow/#job-function-execution-policies) and cannot be raised by workflow authors.

### How It Works

Two platform hard limits guard job function dispatches:

- **Workspace-wide limit (100)**: Caps the total number of concurrently running job function dispatches within a single workspace. Applies to every dispatch regardless of whether `executionPolicyKey` is set.
- **Per-key fallback limit (50)**: A safety net that only kicks in when a dispatch supplies an `executionPolicyKey` and the matching execution policy does not declare a user-defined `concurrencyPolicy.maxConcurrentExecutions`. Once a policy sets its own cap, that user cap replaces this fallback and the platform per-key limit is no longer consulted.

When a dispatch hits any of these caps (or a user-declared execution policy cap), the workflow is suspended to `PENDING_RESUME` and retried after a short delay (default 5s).

### Behavior

- Both platform limits and user-declared execution policies are enforced independently. A dispatch must satisfy all applicable caps to run.
- The workspace-wide job function limit is independent of the workflow-execution caps above — a workflow that is already `RUNNING` can still have its dispatches suspended when the workspace hits the 100-dispatch ceiling.
- The per-key fallback protects operators from accidentally leaving a key unbounded when they only declare the policy to register a valid key without a user-defined cap.

## Executor Job Function Concurrency Limit

The Tailor Platform limits the number of concurrently running Executor [job function operations](/guides/executor/job-function-operation) to **100 per workspace**. This ensures fair scheduling across workspaces: a sudden spike of executions in one workspace does not delay job executions in other workspaces.

### How It Works

The limit applies to job function operations only, regardless of how they were triggered (schedule, event, or incoming webhook). Other operation kinds are not counted against this limit; in particular, workflow operations are governed by the [Workflow concurrency limits](#workflow-concurrency-limits) described above.

When the limit is reached, new executions are not rejected and never fail because of the limit. Instead, they remain pending and are started automatically, oldest first, as running executions complete.

### Behavior

- Executions above the limit are queued, not dropped — every execution eventually runs.
- Queued executions start in creation order, so ordering within a workspace is preserved.
- During a large burst, the delay before an execution starts is roughly `(queued executions ÷ 100) × average execution duration`. For example, a burst of 10,000 executions that each run for 30 seconds drains in about 50 minutes.
- Executions triggered by different workspaces are isolated from each other: another workspace's burst does not affect your executions.

## Memory Limits

The Tailor Platform enforces fixed memory limits on function executions to prevent resource exhaustion. These limits are not configurable.

- **Function**: 32 MB per execution
- **JobFunction**: 256 MB per execution

When an execution exceeds its memory limit, it is terminated and returns a `Memory limit exceeded` error indicating the memory used and the limit (for example, `used 50 MB of 32 MB limit`).

## TailorDB Select Result Size Limit

When a Function or JobFunction queries TailorDB data using `select`, the total size of the result set is limited to 128 MB. If the result exceeds this limit, the query fails with an error. Use pagination, column filtering, or query filters to keep result sizes within the limit.

## Fetch Response Body Size Limit

When a Function or JobFunction uses `fetch()`, buffered methods such as `response.text()` and `response.json()` are limited to 10 MB. If the response body exceeds this limit, the method fails with an error.

This limit does not apply to streaming methods (`response.body.getReader()`, `response.body.pipeTo()`, `response.body.pipeThrough()`). Use these to handle responses larger than 10 MB.

## Best Practices

When working within platform limits, consider the following best practices:

1. **Avoid deep service nesting**: Design workflows to minimize the depth of service-to-service calls. Consider flattening complex nested operations or using alternative patterns like event-driven architectures with proper safeguards.

1. **Monitor call patterns**: Track service interaction patterns to detect potential recursive scenarios early.

1. **Design for limits**: Anticipate depth limits and handle them gracefully in your application logic.

1. **Use alternative patterns**: Consider using event-driven architectures, queuing systems, or batch processing for complex workflows that might exceed depth limits.

1. **Design for workflow concurrency**: If your application triggers many workflow executions simultaneously, be aware that excess executions will queue as `PENDING`. Design your application to handle this gracefully rather than assuming immediate execution.

1. **Design for job function concurrency**: Bulk operations that fan out into many job function executions (for example, a data import where each record triggers downstream executors) will be smoothed to 100 concurrent executions. Do not build integrations that depend on a fixed completion time for such bursts — chain downstream steps on completion events instead of fixed schedules.

1. **Design for memory limits**: Process large datasets in batches or stream them rather than loading everything into memory at once.

1. **Choose JobFunction for memory-intensive workloads**: If your workload exceeds the 32 MB Function limit, use JobFunction (256 MB) instead.

1. **Paginate large TailorDB queries**: When querying large datasets from TailorDB, use pagination and column filtering to keep result sizes within the 128 MB limit.

1. **Use streaming for large HTTP responses**: When fetching large external resources, use `response.body.getReader()` instead of `.text()` or `.json()` to avoid the 10 MB buffered response body limit.
