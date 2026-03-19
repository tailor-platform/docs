---
doc_type: guide
---

# Bulk Upsert

Bulk Upsert queries enable inserting or updating large amounts of resources with a single query.
We can enable the `bulkUpsert` setting for your type, which will automatically generate the bulk upsert query type: `bulkUpsert<type_name>s`.

```typescript
import { db } from "@tailor-platform/sdk";

export const document = db
  .type("Document", "Document model", {
    // ...fields
  })
  .features({
    bulkUpsert: true,
  });
```

TailorDB auto-generates `bulkUpsertDocuments`, allowing you to quickly bulk upsert data for Document.
Use the following query to upsert existing document resources:

```graphql {{ title: 'query' }}
mutation {
  bulkUpsertDocuments(
    input: [
      { id: "<resource_uuid_1>", documentStatus: "documentToUpdate1" }
      { id: "<resource_uuid_2>", documentStatus: "documentToUpdate2" }
    ]
  )
}
```

If the input contains existing IDs, the data properties will be updated for those inputs. New data records will be created if the ID does not exist, is null, or is not passed as an input property.

Here are examples of queries for creating new records in TailorDB when using bulk upsert.

```graphql {{ title: 'query' }}
mutation {
  bulkUpsertDocuments(
    input: [
      { id: null, documentStatus: "createsNewDocument1" }
      { id: null, documentStatus: "createsNewDocument2" }
    ]
  )
}
```

```graphql {{ title: 'query' }}
mutation {
  bulkUpsertDocuments(
    input: [{ documentStatus: "createsNewDocument1" }, { documentStatus: "createsNewDocument2" }]
  )
}
```

The maximum number of items that can be included in a single bulk upsert operation is 1000.

## BulkUpsert with PluralForm settings

When `PluralForm` is configured in the settings, as mentioned in the example below, TailorDB auto-generates `bulkUpsertUserDataList` instead of `bulkUpsertUserData` for bulk upserting data of the `UserData` type. Refer [PluralForm](/guides/tailordb/advanced-settings/uncountable-nouns) to learn about its setting.

```typescript
import { db } from "@tailor-platform/sdk";

export const userData = db
  .type("UserData", "UserData model", {
    // ...fields
  })
  .features({
    bulkUpsert: true,
    pluralForm: "UserDataList",
  });
```
