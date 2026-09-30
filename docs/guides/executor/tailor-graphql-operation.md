---
description: "Run a GraphQL query or mutation against your application from an executor, with variables built from the trigger payload."
doc_type: guide
---

# TailorGraphql Operation

The TailorGraphql operation enables interaction with TailorDB to perform operations such as querying data or making changes (mutations).
This operation type is ideal for database operations triggered by events, webhooks, or schedules.

## Configuration Example

```typescript {{title:'executor.ts'}}
import { createExecutor, recordCreatedTrigger } from "@tailor-platform/core/executor";
import { product } from "./tailordb/product";

export const tailorGraphqlExecutor = createExecutor({
  name: "tailor-graphql-executor",
  description: "Execute GraphQL operations",
  trigger: recordCreatedTrigger({ type: product }),
  operation: {
    kind: "graphql",
    appName: "ims",
    invoker: "eventUser",
    query: `
        mutation createProduct($categoryID: ID!, $title: String!) {
          createProduct(input: {
            categoryID: $categoryID
            title: $title
          }) {
            id
          }
        }
      `,
    variables: ({ newRecord }) => ({
      categoryID: newRecord.id,
      title: newRecord.name + " Product",
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
| `trigger`     | object | Yes      | The type of trigger (webhook, event, or schedule)                                                                                           |

**GraphQL Operation Properties**

| Property    | Type     | Required | Description                                                            |
| ----------- | -------- | -------- | ---------------------------------------------------------------------- |
| `kind`      | string   | Yes      | Must be `"graphql"` for TailorGraphql operations                       |
| `appName`   | string   | Yes      | The name of the TailorDB application                                   |
| `query`     | string   | Yes      | The GraphQL query or mutation to execute                               |
| `variables` | function | No       | A function that returns the variables to pass to the GraphQL operation |
| `invoker`   | string   | No       | The invoker of the operation (e.g., `"eventUser"`)                     |

**Executor Properties**

| Property       | Type   | Required | Description                                                                                                                                 |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | string | Yes      | The name of the executor. The name field has the validation rule `^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$`, and it does not allow capital letters |
| `workspace_id` | string | Yes      | The ID of the workspace that the executor namespace belongs to                                                                              |
| `description`  | string | No       | The description of the executor                                                                                                             |
| `trigger`      | object | Yes      | The type of trigger (webhook, event, or schedule)                                                                                           |

**TailorGraphql Operation Properties**

| Property    | Type   | Supports Scripting                                                              | Required | Description                                    |
| ----------- | ------ | ------------------------------------------------------------------------------- | -------- | ---------------------------------------------- |
| `app_name`  | string | -                                                                               | Yes      | The name of the TailorDB application           |
| `query`     | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | Yes      | The GraphQL query or mutation to execute       |
| `variables` | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | No       | The variables to pass to the GraphQL operation |
| `invoker`   | object | -                                                                               | No       | The invoker of the operation                   |

Refer to the [Tailor Platform Provider documentation](https://registry.terraform.io/providers/tailor-platform/tailor/latest/docs/resources/executor) for more details on executor properties.

**Executor Properties**

| Property      | Type   | Required | Description                                                                                                                                 |
| ------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Name`        | string | Yes      | The name of the executor. The name field has the validation rule `^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$`, and it does not allow capital letters |
| `Description` | string | No       | The description of the executor                                                                                                             |
| `Trigger`     | object | Yes      | The type of trigger (e.g., #TriggerIncomingWebhook, #TriggerEvent, #TriggerSchedule)                                                        |

**TargetTailorGraphql Properties**

| Property    | Type   | Supports Scripting                                                              | Required | Description                                    |
| ----------- | ------ | ------------------------------------------------------------------------------- | -------- | ---------------------------------------------- |
| `AppName`   | string | -                                                                               | Yes      | The name of the TailorDB application           |
| `Query`     | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | Yes      | The GraphQL query or mutation to execute       |
| `Variables` | string | [JavaScript](/reference/api/js-scripting) / [CEL](/reference/api/cel-scripting) | No       | The variables to pass to the GraphQL operation |
| `Invoker`   | object | -                                                                               | No       | The invoker of the operation                   |

## Related Documentation

- [TailorDB Overview](/guides/tailordb/overview)
- [Auto-generated API](/guides/tailordb/auto-generated-api)
- [Event-Based Trigger](/guides/executor/event-based-trigger)
- [Incoming Webhook Trigger](/guides/executor/incoming-webhook-trigger)
- [Schedule-Based Trigger](/guides/executor/schedule-based-trigger)
