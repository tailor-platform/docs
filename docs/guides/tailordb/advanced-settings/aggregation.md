---
doc_type: guide
---

# Aggregation

Aggregation queries enable the summarization and analysis of large datasets.\
Through leveraging these aggregation queries, you can quickly aggregate your records to identify trends, relationships, and anomalies, which provide insights for your decision-making.

You can enable the `Aggregation` setting for your type, which will automatically generate the aggregate query type: `aggregate<type_name>s`.\
Available operations are `count`, `max`, `min`, `sum`, `avg`, `totalSize`, and `groupBy`.

## Example

```typescript
import { db } from "@tailor-platform/sdk";

export const payroll = db
  .type("Payroll", "payroll model", {
    name: db.string().description("name"),
    paidAt: db.datetime().description("paidAt").required(),
    paidAmount: db.int().description("paidAmount").required(),
    payrollType: db.enum(["PAID", "UNPAID"]).description("paidType").required(),
    payrollCode: db.string().description("payrollCode"),
    customerID: db.uuid().description("customerID"),
  })
  .features({
    aggregation: true,
  });
```

TailorDB auto-generates `aggregatePayrolls`, allowing you to quickly retrieve summarized results for Payroll.\
Based on the `payroll` type, here's the sample query to aggregate the payroll data:

```graphql {{ title: 'query' }}
query {
  aggregatePayrolls {
    max {
      paidAmount
    }
    sum {
      paidAmount
    }
    min {
      paidAmount
    }
    avg {
      paidAmount
    }
    count {
      name
      toHour {
        paidAt
      }
    }
    totalSize
    groupBy {
      toDay {
        paidAt
      }
      name
    }
  }
}
```

In the `[PayrollsAggregationResult]` type, you can specify how you aggregate the data by using `groupBy`.\
Other fields such as `count` and `sum` will return results based on the grouping specified in `groupBy`.\
However `totalSize` always returns the total number of records regardless of the grouping.

The calculation fields `count`, `sum` `min` and `max` will be applicable only for the `Integer` and `Float` types.\
Besides, grouping by time windows such as `toDay` and `toHour` will be applicable only for the `Datetime` and `Date` types.

For SQL-based aggregate operations in Function service, see [SQL aggregate functions](/guides/function/accessing-tailordb#aggregatefunctions).
