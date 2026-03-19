---
doc_type: guide
---

# TailorDB CDC

## Publish record events for database triggers

Change data capture (CDC) enables you to track and capture all changes in your data within TailorDB, including new record insertions, updates to existing records, and deletions. To use this feature, enable `PublishRecordEvents` in the settings for your desired data type in TailorDB. Once enabled, any changes to records of this type will trigger the publication of record events. These events are then processed by the corresponding `Executor` service, which initiates the jobs defined based on these changes.

For example, to call a trigger for every PurchaseOrder type record created, you'll need to enable `PublishRecordEvents` in the settings. Refer [Event based trigger](/tutorials/setup-executor/event-based-trigger#4enablepublishrecordeventssettings) to learn more.

```typescript
import { db } from "@tailor-platform/sdk";

export const purchaseOrder = db
  .type(
    "PurchaseOrder",
    "Model for Purchase Order. Each record of the Purchase Order represents unique combination of a Product, a Location, and a Supplier.",
    {
      // ...fields
    },
  )
  .features({
    aggregation: true,
    publishRecordEvents: true,
  });
```
