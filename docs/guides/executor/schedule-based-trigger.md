---
description: "Run an executor on a cron schedule for periodic processing and maintenance tasks."
doc_type: guide
---

# Schedule-based Trigger

Schedule-based triggers enable you to automate task execution at specified intervals using cron expressions. This is ideal for periodic data processing, maintenance tasks, and scheduled operations.

Follow the [tutorial](/tutorials/setup-executor/schedule-based-trigger) for setup instructions.

## Basic Schedule-Based Trigger Configuration

The following example shows the basic structure of a schedule-based trigger:

```typescript {{title:'executors/scheduled-event-executor.ts'}}
import { createExecutor, scheduleTrigger } from "@tailor-platform/sdk";

export default createExecutor({
  name: "scheduled-event-executor",
  description: "execute operation on schedule",
  trigger: scheduleTrigger({
    cron: "* * * * *",
    timezone: "UTC",
  }),
  operation: {
    // Choose one of the operation types:
    // kind: "graphql", ...
    // kind: "webhook", ...
    // kind: "function", ...
    // kind: "jobFunction", ...
  },
});
```

## Schedule Configuration

Schedule-based triggers use cron expressions to define when operations should execute:

- `cron` - A cron expression defining the schedule (e.g., `"0 */6 * * *"` for every 6 hours)
- `timezone` - The timezone for schedule interpretation (e.g., `"UTC"`, `"America/New_York"`)

### Common Cron Expression Examples

- `"* * * * *"` - Every minute
- `"0 * * * *"` - Every hour
- `"0 0 * * *"` - Every day at midnight
- `"0 0 * * 0"` - Every Sunday at midnight
- `"0 9 * * 1-5"` - Every weekday at 9 AM

## Properties

**Schedule-Based Trigger Properties**

| Property   | Type   | Required | Description                                                                                           |
| ---------- | ------ | -------- | ----------------------------------------------------------------------------------------------------- |
| `timezone` | string | No       | This refers to the specific time zone in which the job's scheduled times are interpreted and executed |
| `cron`     | string | Yes      | The intervals at which the job is scheduled to run (cron expression)                                  |

For detailed operation properties, see the dedicated operation pages:

- [TailorGraphql Operation Properties](tailor-graphql-operation#properties)
- [Webhook Operation Properties](webhook-operation#properties)
- [Function Operation Properties](function-operation#properties)
- [Job Function Operation Properties](job-function-operation#properties)

Learn more about executor properties in the [Tailor Platform Provider documentation](https://registry.terraform.io/providers/tailor-platform/tailor/latest/docs/resources/executor).

## Related Documentation

- [Schedule-based Trigger Tutorial](/tutorials/setup-executor/schedule-based-trigger)
