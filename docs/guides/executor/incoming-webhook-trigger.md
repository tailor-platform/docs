---
doc_type: guide
---

# Incoming Webhook Trigger

The incoming webhook trigger exposes an HTTP endpoint that can be called by external services to trigger executor operations. This enables integration with third-party systems and services.

Follow the [tutorial](/tutorials/setup-executor/incoming-webhook-trigger) for setup instructions.

## Basic Incoming Webhook Trigger Configuration

The following example shows the basic structure of an incoming webhook trigger:

```typescript {{ title: 'incoming-webhook-based-executor.ts' }}
import { createExecutor, incomingWebhookTrigger } from "@tailor-platform/sdk";

export default createExecutor({
  name: "incoming-webhook-based-executor",
  description: "exposes an endpoint",
  trigger: incomingWebhookTrigger<{
    body: { event: string };
    headers: Record<string, string>;
  }>(),
  operation: {
    // Choose one of the operation types:
    // kind: "tailorGraphql", ...
    // kind: "webhook", ...
    // kind: "function", ...
    // kind: "jobFunction", ...
  },
});
```

## Payload Format

The payload structure received by the Executor's Incoming Webhook will have the following format:

```json
{
  "args": {
    "method": "POST", // The HTTP method (e.g., POST, GET)
    "headers": {
      "x-name": "example", // Headers are available in lowercase with hyphens
      "x-array-elements": ["element1", "element2"] // header can be array
    },
    "body": {
      "name": "John",
      "full_name": { "first_name": "John", "last_name": "Doe" }
    }
  }
}
```

The Executor's incoming webhook supports both `application/json` and `application/x-www-form-urlencoded` content types. When using form-urlencoded, form data is parsed into the body object with single values as strings and multiple values as arrays.

Here's an example of how to access different parts of the webhook payload:

When receiving form-urlencoded data, you can access the values directly from the body object:

## Webhook Data Access

Incoming webhook triggers provide access to HTTP request data through the `args` object:

- `args.body` - The request payload/body
- `args.headers` - The HTTP headers from the request
- `args.method` - The HTTP method used (typically POST)
- `args.query` - Query parameters from the URL

This data can be used in operation variables to process the incoming webhook data appropriately.

## Response

By default, the incoming webhook trigger responds with `204 No Content`. The executor operation runs asynchronously after the response is sent.

To customize the response, pass a `response` option to `incomingWebhookTrigger()`. The function receives the same `args` as the operation and returns the response body. The status code defaults to `200` when `response` is set, and can be overridden with `statusCode`.

```typescript
incomingWebhookTrigger<WebhookPayload>({
  response: (args) => ({ challenge: args.body.challenge }),
})
```

## Properties

**Incoming Webhook Trigger Properties**

| Property  | Type   | Required | Description                                 |
| --------- | ------ | -------- | ------------------------------------------- |
| `webhook` | object | Yes      | Empty object `{}` to enable webhook trigger |

For detailed operation properties, see the dedicated operation pages:

- [TailorGraphql Operation Properties](tailor-graphql-operation#properties)
- [Webhook Operation Properties](webhook-operation#properties)
- [Function Operation Properties](function-operation#properties)
- [Job Function Operation Properties](job-function-operation#properties)

Refer to the [Tailor Platform Provider documentation](https://registry.terraform.io/providers/tailor-platform/tailor/latest/docs/resources/executor) for more details on executor properties.

## Related Documentation

- [Incoming Webhook Trigger Tutorial](/tutorials/setup-executor/incoming-webhook-trigger)
