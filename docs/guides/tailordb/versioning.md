---
doc_type: guide
---

# Versioning with History Tables

Some applications require preserving previous versions of data when updates or changes occur.
Using [TailorDB CDC](/guides/tailordb/advanced-settings/tailordb-cdc), you can capture and log data modifications in real-time, storing prior record versions in a dedicated history table.
This approach preserves historical data and enables change monitoring and analysis over time.

## How to enable Data Versioning

1. Create a history table
2. Enable `publishEvents` feature
3. Add an event based trigger

## Example

### 1. Create a history table

Let's create a history table for the `StockSummary` type to log its data changes.

```typescript
db.type("StockSummaryHistory", {
  variantID: db.uuid({ required: true, description: "Variant ID" }),
  variant: db.link("ProductVariant", "variantID"),
  onHoldQuantity: db.float({ required: true, description: "onHoldQuantity" }),
  availableQuantity: db.float({
    required: true,
    description: "availableQuantity",
  }),
  inStockQuantity: db.float({
    description: "DO NOT UPDATE FROM THE FRONT END. The quantity of the product in stock.",
    hooks: {
      create: "decimal(_value.onHoldQuantity) + decimal(_value.availableQuantity)",
      update: "decimal(_value.onHoldQuantity) + decimal(_value.availableQuantity)",
    },
  }),
  totalCost: db.float({ required: true, description: "totalCost" }),
  averageCost: db.float({
    description: "averageCost",
    hooks: {
      create: `(decimal(_value.onHoldQuantity) + decimal(_value.availableQuantity)) != decimal(0.0) ?
          decimal(_value.totalCost) / (decimal(_value.onHoldQuantity) + decimal(_value.availableQuantity)) :
          decimal(0.0)`,
      update: `(decimal(_value.onHoldQuantity) + decimal(_value.availableQuantity)) != decimal(0.0) ?
          decimal(_value.totalCost) / (decimal(_value.onHoldQuantity) + decimal(_value.availableQuantity)) :
          decimal(0.0)`,
    },
  }),
});
```

### 2. Enable `publishEvents` feature

By enabling `publishEvents` in the `StockSummary` features, you can create an event-based trigger that executes on every `StockSummary` record update.

```typescript
db.type("StockSummary", {
  // fields...
}).features({
  publishEvents: true,
});
```

### 3. Add an event based trigger

The `stockSummaryHistoryWithEvent` trigger executes on each `StockSummary` record update.
It logs the old record by creating an entry in the history table.

```typescript
executor
  .event("tailordb.type_record.updated")
  .condition(`args.namespaceName == "my-tailordb" && args.typeName == "StockSummary"`)
  .graphql({
    query: `
        mutation ($input: StockSummaryHistoryCreateInput!) {
          createStockSummaryHistory(input: $input) {
            id
          }
        }
      `,
    variables: `({
        "input": {
          "variantID": args.oldRecord.variantID,
          "onHoldQuantity": args.oldRecord.onHoldQuantity,
          "availableQuantity": args.oldRecord.availableQuantity,
          "totalCost": args.oldRecord.totalCost
        }
      })`,
  });
```

Refer to the [Event based trigger](/tutorials/setup-executor/event-based-trigger) tutorial for detailed steps on setting up an event-based trigger.
Once the trigger is configured, proceed with the following steps to confirm it is working correctly.

1. Create a record in `StockSummary` table.

```graphql {{title: 'GraphQL'}}
mutation {
  createStockSummary(
    input: {
      variantID: "fc9349f5-2398-5aa6-a6a7-478c8db009ec"
      onHoldQuantity: 20
      availableQuantity: 20
      totalCost: 800
    }
  ) {
    id
  }
}
```

2. Update the record in `StockSummary` table.

```graphql {{title: 'GraphQL'}}
mutation {
  updateStockSummary(id: "f701637c-12b1-4dab-ab45-3e952d8ff0b6", input: { availableQuantity: 60 }) {
    id
  }
}
```

Execute the following query to view the update history of the record in the history table.

```graphql {{title: 'GraphQL'}}
{
  stockSummaryHistories(query: { variantID: { eq: "fc9349f5-2398-5aa6-a6a7-478c8db009ec" } }) {
    edges {
      node {
        id
        variantID
        availableQuantity
      }
    }
  }
}
```

```graphql {{title: 'Result'}}
{
  "data": {
    "stockSummaryHistories": {
      "edges": [
        {
          "node": {
          	"id": "323c9cff-a75f-45a5-aea5-33a367b4e0ce",
          	"variantID": "fc9349f5-2398-5aa6-a6a7-478c8db009ec",
         	"availableQuantity": 20
          }
        }
      ]
    }
  }
}
```
