---
description: "Send an HTTP POST request to an external endpoint from an executor, with headers and a body built from the trigger payload."
doc_type: guide
sdk_version: "2.25.0"
---

# Webhook Operation

The Webhook operation enables sending HTTP requests from your executor service to external endpoints. Currently, only POST method is supported. This operation type is ideal for integrating with external services, sending notifications, or triggering workflows in other systems.

## Configuration Example

```typescript {{title:'executor.ts'}}
import { createExecutor, recordCreatedTrigger } from "@tailor-platform/sdk";
import { order } from "./tailordb/order";

createExecutor({
  name: "webhook-executor",
  description: "Send HTTP requests to external endpoints",
  // Choose one of the trigger types:
  // recordCreatedTrigger({ type: order })
  // incomingWebhookTrigger()
  // scheduleTrigger({ cron: "0 * * * *" })
  trigger: recordCreatedTrigger({ type: order }),
  operation: {
    kind: "webhook",
    url: () => "https://api.example.com/webhook",
    headers: { "Content-Type": "application/json" },
    requestBody: ({ newRecord }) => ({
      message: "Notification from executor",
      data: newRecord,
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
| `trigger`     | object | Yes      | The type of trigger (recordCreatedTrigger, incomingWebhookTrigger, or scheduleTrigger)                                                      |

**Webhook Operation Properties**

| Property      | Type     | Required | Description                                                       |
| ------------- | -------- | -------- | ----------------------------------------------------------------- |
| `kind`        | string   | Yes      | Must be `"webhook"`                                               |
| `url`         | function | Yes      | A function that returns the URL of the API endpoint               |
| `headers`     | object   | No       | Key-value pairs for HTTP headers                                  |
| `requestBody` | function | No       | A function that returns the payload to be included in the request |

**Executor Properties**

| Property       | Type   | Required | Description                                                                                                                                 |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | string | Yes      | The name of the executor. The name field has the validation rule `^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$`, and it does not allow capital letters |
| `workspace_id` | string | Yes      | The ID of the workspace that the executor namespace belongs to                                                                              |
| `description`  | string | No       | The description of the executor                                                                                                             |
| `trigger`      | object | Yes      | The type of trigger (webhook, event, or schedule)                                                                                           |

**Webhook Operation Properties**

| Property  | Type   | Supports Scripting                                                              | Required | Description                                          |
| --------- | ------ | ------------------------------------------------------------------------------- | -------- | ---------------------------------------------------- |
| `url`     | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | Yes      | The URL of the API endpoint                          |
| `body`    | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | No       | The payload or message to be included in the request |
| `headers` | array  | -                                                                               | No       | The headers to send with the webhook                 |

Learn more about executor properties in the [Tailor Platform Provider documentation](https://registry.terraform.io/providers/tailor-platform/tailor/latest/docs/resources/executor).

**Executor Properties**

| Property      | Type   | Required | Description                                                                                                                                 |
| ------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Name`        | string | Yes      | The name of the executor. The name field has the validation rule `^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$`, and it does not allow capital letters |
| `Description` | string | No       | The description of the executor                                                                                                             |
| `Trigger`     | object | Yes      | The type of trigger (e.g., #TriggerIncomingWebhook, #TriggerEvent, #TriggerSchedule)                                                        |

**TargetWebhook Properties**

| Property  | Type   | Supports Scripting                                                              | Required | Description                                          |
| --------- | ------ | ------------------------------------------------------------------------------- | -------- | ---------------------------------------------------- |
| `URL`     | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | Yes      | The URL of the API endpoint                          |
| `Body`    | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | No       | The payload or message to be included in the request |
| `Headers` | array  | -                                                                               | No       | The headers to send with the webhook                 |

## Related Documentation

- [Event-Based Trigger](/guides/executor/event-based-trigger)
- [Incoming Webhook Trigger](/guides/executor/incoming-webhook-trigger)
- [Schedule-Based Trigger](/guides/executor/schedule-based-trigger)
- [Supported Events](/guides/events)
