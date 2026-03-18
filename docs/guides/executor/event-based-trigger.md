---
doc_type: guide
---

# Event-based Trigger

In this trigger, you can specify the type of event that initiates it (e.g., TailorDB data update, IdP user changes, or authentication events) and outline the specific conditions or criteria for its execution.

Refer [Supported Events](/guides/events) to learn about the different types of events supported in the Tailor Platform. Follow the [tutorial](/tutorials/setup-executor/event-based-trigger) for setup instructions.

## Basic Event-Based Trigger Configuration

The following example shows the basic structure of an event-based trigger using the SDK:

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

Event-based triggers provide access to event-specific data through the `args` object. The available data depends on the event type.

`args.eventType` is available for all event types, indicating which specific event triggered the executor (e.g., `tailordb.type_record.created`). This is useful when an executor listens to multiple event types and needs to differentiate between them.

### TailorDB Events

- `args.eventType` - The type of event that occurred (e.g., `tailordb.type_record.created`)
- `args.namespaceName` - The namespace where the event occurred
- `args.typeName` - The type name of the record
- `args.newRecord` - The new/created record data (available for created and updated events)
- `args.oldRecord` - The previous record data (available for updated and deleted events)

### IdP Events

- `args.eventType` - The type of event that occurred (e.g., `idp.user.created`)
- `args.namespaceName` - The namespace where the event occurred
- `args.userId` - The ID of the affected IdP user

### Auth Events

- `args.eventType` - The type of event that occurred (e.g., `auth.access_token.issued`)
- `args.namespaceName` - The namespace where the event occurred

### Pipeline Events

- `args.eventType` - The type of event that occurred (e.g., `pipeline.resolver.executed`)
- `args.namespaceName` - The namespace where the event occurred
- `args.resolverName` - The name of the resolver
- `args.result` - The resolver execution result (on success)
- `args.error` - The error message (on failure)

## Operation Types

For detailed operation properties, see the dedicated operation pages:

- [TailorGraphql Operation](tailor-graphql-operation)
- [Webhook Operation](webhook-operation)
- [Function Operation](function-operation)
- [Job Function Operation](job-function-operation)

## Related Documentation

- [Supported Events](/guides/events)
- [Event-based Trigger Tutorial](/tutorials/setup-executor/event-based-trigger)
