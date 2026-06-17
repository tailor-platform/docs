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

1. **Design for memory limits**: Process large datasets in batches or stream them rather than loading everything into memory at once.

1. **Choose JobFunction for memory-intensive workloads**: If your workload exceeds the 32 MB Function limit, use JobFunction (256 MB) instead.

1. **Paginate large TailorDB queries**: When querying large datasets from TailorDB, use pagination and column filtering to keep result sizes within the 128 MB limit.

1. **Use streaming for large HTTP responses**: When fetching large external resources, use `response.body.getReader()` instead of `.text()` or `.json()` to avoid the 10 MB buffered response body limit.
