---
description: "Run a JavaScript or TypeScript function synchronously from an executor and use its return value."
doc_type: guide
---

# Function Operation

The Function operation executes JavaScript/TypeScript code synchronously via the Function Service. Functions return results directly and are ideal for custom business logic that cannot be expressed in GraphQL, data transformations, integration with external APIs, and complex calculations.

For more details on writing functions, refer to the [Function Service](/guides/function/overview) documentation.

## Configuration Example

```typescript
createExecutor({
  name: "function-executor",
  description: "Execute synchronous function",
  trigger: recordCreatedTrigger({ type: dataRecord }),
  operation: {
    kind: "function",
    body: async ({ newRecord }) => {
      // Process the data
      const data = newRecord;
      const timestamp = new Date().toISOString();
      // Function logic here
      return { data, timestamp };
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
| `trigger`     | object | Yes      | The type of trigger (e.g., `recordCreatedTrigger`, `incomingWebhookTrigger`, `scheduleTrigger`)                                             |

**Function Operation Properties**

| Property | Type     | Required | Description                                                                                                              |
| -------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `kind`   | string   | Yes      | Must be `"function"` for function operations                                                                             |
| `body`   | function | Yes      | An async function containing the business logic. Receives trigger context (e.g., `newRecord`, `oldRecord`) as parameters |

**Executor Properties**

| Property       | Type   | Required | Description                                                                                                                                 |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | string | Yes      | The name of the executor. The name field has the validation rule `^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$`, and it does not allow capital letters |
| `workspace_id` | string | Yes      | The ID of the workspace that the executor namespace belongs to                                                                              |
| `description`  | string | No       | The description of the executor                                                                                                             |
| `trigger`      | object | Yes      | The type of trigger (webhook, event, or schedule)                                                                                           |

**Function Operation Properties**

| Property    | Type   | Supports Scripting                                                              | Required | Description                                                                               |
| ----------- | ------ | ------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `name`      | string | -                                                                               | Yes      | The name of the function                                                                  |
| `script`    | string | -                                                                               | Yes      | The JavaScript/TypeScript code to execute                                                 |
| `invoker`   | object | -                                                                               | No       | The invoker of the operation                                                              |
| `variables` | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | No       | The variables to pass to the function. Can access trigger-specific data via `args` object |

**Executor Properties**

| Property      | Type   | Required | Description                                                                                                                                 |
| ------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Name`        | string | Yes      | The name of the executor. The name field has the validation rule `^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$`, and it does not allow capital letters |
| `Description` | string | No       | The description of the executor                                                                                                             |
| `Trigger`     | object | Yes      | The type of trigger (e.g., #TriggerIncomingWebhook, #TriggerEvent, #TriggerSchedule)                                                        |

**TargetFunction Properties**

| Property     | Type   | Supports Scripting                                                              | Required | Description                                                                               |
| ------------ | ------ | ------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `Name`       | string | -                                                                               | Yes      | The name of the function                                                                  |
| `ScriptPath` | string | -                                                                               | Yes      | The path to the JavaScript/TypeScript script file                                         |
| `Invoker`    | object | -                                                                               | No       | The invoker of the operation                                                              |
| `Variables`  | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | No       | The variables to pass to the function. Can access trigger-specific data via `args` object |

## Related Documentation

- [Function Service Overview](/guides/function/overview)
- [Function Service Examples](/guides/function/examples)
- [Accessing TailorDB from Functions](/guides/function/accessing-tailordb)
- [Event-Based Trigger](/guides/executor/event-based-trigger)
- [Incoming Webhook Trigger](/guides/executor/incoming-webhook-trigger)
- [Schedule-Based Trigger](/guides/executor/schedule-based-trigger)
