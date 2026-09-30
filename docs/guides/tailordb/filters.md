---
description: "Filter operators available for each data type in list queries and conditional updates, with examples."
doc_type: guide
---

# Query filters

To filter data, you can use query filters.

The available operator sets for query filters depend on the data type. These same filters can also be used for [conditional updates](/guides/tailordb/auto-generated-api#conditionalupdate).

To apply a query filter to a `<data_type>` type, use the `input <data_type>Filter` input.

For example, for a `String` data type, use `input StringFilter`.

## Filters for each data type

### StringFilter

| Operator     | Description                                  |
| ------------ | -------------------------------------------- |
| eq           | = Equals                                     |
| ne           | \<> or != Not Equals                         |
| in           | Allows you to specify multiple string values |
| nin          | Allows you to specify multiple string values |
| contains     | Contains target string                       |
| notContains  | Does not contain target string               |
| hasPrefix    | Starts with target string                    |
| hasSuffix    | Ends with target string                      |
| notHasPrefix | Does not start with target string            |
| notHasSuffix | Does not end with target string              |
| regex        | Regular expression search                    |

#### Examples

```graphql {{ title: "Pick data where carName equals XXX" }}
{
  cars(query: { carName: { eq: "XXX" } }) {
    edges {
      node {
        id
      }
    }
  }
}
```

```graphql {{ title: "Pick data where carName matches regex [0-9]+" }}
{
  cars(query: { carName: { regex: "[0-9]+" } }) {
    edges {
      node {
        id
      }
    }
  }
}
```

```graphql {{ title: "Pick data where carName contains YY string" }}
{
  cars(query: { carName: { contains: "YY" } }) {
    edges {
      node {
        id
      }
    }
  }
}
```

```graphql {{ title: "Pick data where carName does not contain YY string" }}
{
  cars(query: { carName: { notContains: "YY" } }) {
    edges {
      node {
        id
      }
    }
  }
}
```

```graphql {{ title: "Pick data where carName starts with XX string" }}
{
  cars(query: { carName: { hasPrefix: "XX" } }) {
    edges {
      node {
        id
      }
    }
  }
}
```

```graphql {{ title: "Pick data where carName ends with YY string" }}
{
  cars(query: { carName: { hasSuffix: "YY" } }) {
    edges {
      node {
        id
      }
    }
  }
}
```

```graphql {{ title: "Pick data where carName does not start with XX string" }}
{
  cars(query: { carName: { notHasPrefix: "XX" } }) {
    edges {
      node {
        id
      }
    }
  }
}
```

```graphql {{ title: "Pick data where carName does not end with YY string" }}
{
  cars(query: { carName: { notHasSuffix: "YY" } }) {
    edges {
      node {
        id
      }
    }
  }
}
```

### Integer, Float, DateTime, Date, and Time Filters

| Operator | Description                                                                |
| -------- | -------------------------------------------------------------------------- |
| eq       | =Equals                                                                    |
| ne       | \<>or != Not Equals                                                        |
| lt       | \< Less Than                                                               |
| lte      | \<= Less Than Equals                                                       |
| gt       | > Greater Than                                                             |
| gte      | >= Greater Than Equals                                                     |
| between  | \{min:x, max: y}                                                           |
|          | x \<= n && n \<= y Between x and y.                                        |
| in       | in: \[x, y …. ] Allows you to specify multiple values (n == x or n == y)   |
| nin      | nin: \[x, y …. ] Allows you to specify multiple values (n != x and n != y) |

#### Examples

```graphql {{ title: "Pick data where carNumber is greater than 10" }}
{
  cars(query: { carNumber: { gt: 10 } }) {
    edges {
      node {
        id
      }
    }
  }
}
```

```graphql {{ title: "Pick data where carNumber is between 5 and 10" }}
{
  cars(query: { carNumber: { between: { min: 5, max: 10 } } }) {
    edges {
      node {
        id
      }
    }
  }
}
```

```graphql {{ title: "Pick data where carNumber is 1 or 2 or 3" }}
{
  cars(query: { carNumber: { in: [1, 2, 3] } }) {
    edges {
      node {
        id
      }
    }
  }
}
```

### EnumFilter

| Operator | Description                                                                     |
| -------- | ------------------------------------------------------------------------------- |
| eq       | =Equals enum value                                                              |
| ne       | \<>or != Not Equals enum value                                                  |
| in       | in: \[x, y …. ] Allows you to specify multiple enum values (n == x or n == y)   |
| nin      | nin: \[x, y …. ] Allows you to specify multiple enum values (n != x and n != y) |

### UUIDFilter

| Operator | Description                                                                   |
| -------- | ----------------------------------------------------------------------------- |
| eq       | =Equals enum value                                                            |
| ne       | \<>or != Not Equals enum value                                                |
| in       | in: \[x, y …. ] Allows you to specify multiple id values (n == x or n == y)   |
| nin      | nin: \[x, y …. ] Allows you to specify multiple id values (n != x and n != y) |

### BooleanFilter

| Operator | Description                    |
| -------- | ------------------------------ |
| eq       | =Equals enum value             |
| ne       | \<>or != Not Equals enum value |

### ArrayFilter

Array fields support specialized filters for both length and content operations.

| Operator | Description                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------- |
| len      | Filter based on array length with sub-operators: eq, ne, lt, lte, gt, gte                           |
| has      | Filter based on array elements with sub-operators matching the element type                         |
| all      | Filter based on all array elements meeting a condition with sub-operators matching the element type |
| exists   | Check for the presence of elements in an array                                                      |

#### Examples

```graphql {{ title: "Pick data where manufacturers array has less than 3 elements" }}
{
  starships(query: { manufacturers: { len: { lt: 3 } } }) {
    edges {
      node {
        name
      }
    }
  }
}
```

```graphql {{ title: "Pick data where manufacturers array contains an element with 'Corellian'" }}
{
  starships(query: { manufacturers: { has: { contains: "Corellian" } } }) {
    edges {
      node {
        name
      }
    }
  }
}
```

```graphql {{ title: "Pick data where all elements in manufacturers array contain 'Corp'" }}
{
  starships(query: { manufacturers: { all: { contains: "Corp" } } }) {
    edges {
      node {
        name
      }
    }
  }
}
```

```graphql {{ title: "Array field existence check"}}
{
  starships(query: { manufacturers: { exists: true } }) {
    edges {
      node {
        name
        manufacturers
      }
    }
  }
}
```

Note:

- The `has` operator returns `true` if at least one element in the array matches the specified condition.
- The `all` operator returns `true` only if all elements in the array match the specified condition.
- If an array field's value is null, its `len` is considered 0.
- The `exists` operator can be used to check for the presence of elements in an array.

## Advanced Filters

### And, Or and Not Operators

You can combine filter conditions with logical AND, logical OR, and negation (NOT) across all types.

| Operator | Description                       |
| -------- | --------------------------------- |
| and      | and:\[\{condition1, condition2 }] |
| or       | or:\[\{condition1, condition2 }]  |
| not      | not:\[\{condition}]               |

#### Examples

If you want to query data with different conditions, you don't need to use `and` or `or` operators. You may simply add multiple conditions.

```graphql {{ title: "Pick data where carName equals XXX AND carNumber is greater than 10" }}
{
  cars(query: { carName: { eq: "XXX" }, carNumber: { gt: 10 } }) {
    edges {
      node {
        id
      }
    }
  }
}
```

```graphql {{ title: "Pick data where carName equals XXX AND carName equals YYY"}}
{
  cars(query: { and: [{ carName: { eq: "XXX" } }, { carName: { eq: "YYY" } }] }) {
    edges {
      node {
        id
      }
    }
  }
}
```

```graphql {{ title: "Pick data where carName NOT equals XXX"}}
{
  cars(query: { not: [{ carName: { eq: "XXX" } }] }) {
    edges {
      node {
        id
      }
    }
  }
}
```

If the conditions are matched in one of the not query, then matching data will be excluded from the response.

```graphql {{ title: "Exclude data matching the carName or carNumber"}}
query cars {
  cars(query: { not: [{ carName: { eq: "mercedes" } }, { carNumber: { eq: 10 } }] }) {
    edges {
      node {
        id
        carName
        carNumber
      }
    }
  }
}
```

You can also nest the and/or/not queries.

```graphql {{ title: "Pick data where carName NOT equals XXX OR carNumber is greater than 10"}}
{
  cars(query: { or: { not: { carName: { eq: "XXX" } }, carNumber: { gt: 10 } } }) {
    edges {
      node {
        id
      }
    }
  }
}
```

### Null condition

For all types except `Boolean`, it is possible to filter on null values with the `eq` and `ne` operators.

> Note: For array fields and nested fields, you can use the `exists` operator to check for the existence of elements.

#### Examples

```graphql {{ title: "Null condition"}}
{
  cars(query: { carNumber: { eq: null } }) {
    edges {
      node {
        id
      }
    }
  }
}
```
