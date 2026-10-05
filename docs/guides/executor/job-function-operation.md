---
description: "Run a JavaScript or TypeScript function as a job from an executor, with a 5-minute execution limit for work that needs more than the 60-second function timeout."
doc_type: guide
---

# Job Function Operation

The Job Function operation executes JavaScript or TypeScript code via the Function Service with an execution limit of 5 minutes, longer than the 60-second limit of a `function` operation. It is typically used for tasks that need more than 60 seconds to complete, and for background processes triggered by events or schedules.

Unlike synchronous functions, which return results directly, a Job Function returns an execution ID that can be used to track the status of the task.

For more details on writing functions, refer to the [Function Service](/guides/function/overview) documentation.

::: tip Need more than 5 minutes?
A single job function is capped at 5 minutes. For longer work, split it into steps of 5 minutes or less and orchestrate them with a [Workflow](/guides/workflow/), which can retry failed steps and resume from where it stopped, running for minutes to hours.
:::

## Configuration Example

```typescript
createExecutor({
  name: "job-function-executor",
  description: "Execute job function",
  trigger: scheduleTrigger({ cron: "0 0 * * *" }),
  operation: {
    kind: "jobFunction",
    body: async () => {
      // Task logic (runs up to 5 minutes)
      const taskId = `task-${Date.now()}`;
      const timestamp = new Date().toISOString();
      // Background processing logic here
    },
  },
});
```

## Properties

**Executor Properties**

| Property      | Type   | Required | Description                                                                                                                                 |
| ------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | string | Yes      | The name of the executor. The name field has the validation rule `^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$`, and it does not allow capital letters |
| `description` | string | No       | The description of the executor                                                                                                             |
| `trigger`     | object | Yes      | The type of trigger (e.g., `scheduleTrigger`, `eventTrigger`, `webhookTrigger`)                                                             |

**Job Function Operation Properties**

| Property | Type     | Required | Description                                         |
| -------- | -------- | -------- | --------------------------------------------------- |
| `kind`   | string   | Yes      | Must be `"jobFunction"` for job function operations |
| `body`   | function | Yes      | An async function containing the task logic         |

**Executor Properties**

| Property       | Type   | Required | Description                                                                                                                                 |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | string | Yes      | The name of the executor. The name field has the validation rule `^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$`, and it does not allow capital letters |
| `workspace_id` | string | Yes      | The ID of the workspace that the executor namespace belongs to                                                                              |
| `description`  | string | No       | The description of the executor                                                                                                             |
| `trigger`      | object | Yes      | The type of trigger (webhook, event, or schedule)                                                                                           |

**Job Function Operation Properties**

| Property    | Type   | Supports Scripting                                                              | Required | Description                                                                                   |
| ----------- | ------ | ------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `name`      | string | -                                                                               | Yes      | The name of the job function                                                                  |
| `script`    | string | -                                                                               | Yes      | The JavaScript/TypeScript code to execute                                                     |
| `invoker`   | object | -                                                                               | No       | The invoker of the operation                                                                  |
| `variables` | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | No       | The variables to pass to the job function. Can access trigger-specific data via `args` object |

**Executor Properties**

| Property      | Type   | Required | Description                                                                                                                                 |
| ------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Name`        | string | Yes      | The name of the executor. The name field has the validation rule `^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$`, and it does not allow capital letters |
| `Description` | string | No       | The description of the executor                                                                                                             |
| `Trigger`     | object | Yes      | The type of trigger (e.g., #TriggerIncomingWebhook, #TriggerEvent, #TriggerSchedule)                                                        |

**TargetJobFunction Properties**

| Property     | Type   | Supports Scripting                                                              | Required | Description                                                                                   |
| ------------ | ------ | ------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `Name`       | string | -                                                                               | Yes      | The name of the job function                                                                  |
| `ScriptPath` | string | -                                                                               | Yes      | The path to the JavaScript/TypeScript script file                                             |
| `Invoker`    | object | -                                                                               | No       | The invoker of the operation                                                                  |
| `Variables`  | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | No       | The variables to pass to the job function. Can access trigger-specific data via `args` object |

## Concurrency

Up to **100 job function operations run concurrently per workspace**, regardless of trigger type. Executions beyond the limit are never rejected — they are queued and start automatically, oldest first, as running executions complete. This means a large burst (for example, a bulk import fanning out into thousands of event-triggered executions) is processed at a steady rate rather than all at once, and executions may start minutes after they were triggered. Design time-sensitive integrations to react to completion events rather than assuming a fixed completion time.

See [Platform Limits](/reference/platform/platform-limits#executor-job-function-concurrency-limit) for details.

## Use Cases

Job functions are ideal for:

- **Work beyond the 60-second limit**: Tasks that need more time than a `function` operation allows, running up to 5 minutes
- **Background processing**: Operations that don't require immediate response
- **Batch processing**: Processing large datasets or multiple records
- **External API integrations**: Calling external services that may have high latency
- **File processing**: Uploading, downloading, or transforming files
- **Email notifications**: Sending emails or other notifications
- **Data synchronization**: Syncing data between systems

## Related Documentation

- [Function Service Overview](/guides/function/overview)
- [Function Service Examples](/guides/function/examples)
- [Accessing TailorDB from Functions](/guides/function/accessing-tailordb)
- [Event-Based Trigger](/guides/executor/event-based-trigger)
- [Incoming Webhook Trigger](/guides/executor/incoming-webhook-trigger)
- [Schedule-Based Trigger](/guides/executor/schedule-based-trigger)
