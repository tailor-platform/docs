---
doc_type: guide
---

# Event-based Trigger

In this trigger, you can specify the type of event that initiates it (e.g., TailorDB data update and StateFlow creation) and outline the specific conditions or criteria for its execution.

Refer [Supported Events](/guides/events) to learn about the different types of events supported in the Tailor Platform. Follow the [tutorial](/tutorials/setup-executor/event-based-trigger) for setup instructions.

## Basic Event-Based Trigger Configuration

The following example shows the basic structure of an event-based trigger:

```typescript {{title:'executors/event-based-executor.ts'}}
import { createExecutor, recordCreatedTrigger } from "@tailor-platform/sdk";

export default createExecutor({
  name: "event-based-executor",
  description: "Execute operation based on an event",
  trigger: recordCreatedTrigger({
    type: Category,
    condition: ({ newRecord }) => !!newRecord.id,
  }),
  operation: {
    // Choose one of the operation types:
    // kind: "tailorGraphql", ...
    // kind: "webhook", ...
    // kind: "function", ...
    // kind: "jobFunction", ...
  },
});
```

## Event Data Access

Event-based triggers provide access to event-specific data through the `args` object. The available data depends on the event type:

### TailorDB Events

- `args.namespaceName` - The namespace where the event occurred
- `args.typeName` - The type name of the record
- `args.record` or `args.newRecord` - The record data
- `args.eventType` - The type of event that occurred

### Pipeline Events

- `args.namespaceName` - The namespace where the event occurred
- `args.resolverName` - The name of the resolver
- `args.status` - The execution status (success/failure)
- `args.result` - The resolver execution result

## Properties

**Event-based Trigger Properties**

| Property    | Type   | Required | Description                                                     |
| ----------- | ------ | -------- | --------------------------------------------------------------- |
| `type`      | string | Yes      | The type of event that triggers the executor                    |
| `condition` | string | No       | The condition that must be met for the executor to be triggered |

For detailed operation properties, see the dedicated operation pages:

- [TailorGraphql Operation Properties](tailor-graphql-operation#properties)
- [Webhook Operation Properties](webhook-operation#properties)
- [Function Operation Properties](function-operation#properties)
- [Job Function Operation Properties](job-function-operation#properties)

Refer to the [Tailor Platform Provider documentation](https://registry.terraform.io/providers/tailor-platform/tailor/latest/docs/resources/executor) for more details on executor properties.

## Related Documentation

- [Supported Events](/guides/events)
- [Event-based Trigger Tutorial](/tutorials/setup-executor/event-based-trigger)
