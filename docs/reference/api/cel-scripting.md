# CEL scripting

[CEL Script](https://github.com/google/cel-spec) is used to perform data transformation and run validations in the Tailor Platform.

Here are some places you can utilize CEL:

- `authorization`, `preScript`, `postScript`, `preValidation`, `postValidation` blocks on [resolvers](/guides/resolver)
- `create_expr`, `update_expr` hooks in [TailorDB Hooks](/guides/tailordb/hooks)&#x20;
- `expr` validation in [TailorDB Validations](/guides/tailordb/validations) &#x20;

[Standard operators and functions](https://github.com/google/cel-spec/blob/master/doc/langdef.md#list-of-standard-definitions) as well as [String extensions](https://github.com/google/cel-go/tree/master/ext#strings) can be used.

**Example**:

```go
// filter and extract the IDs of a list
preScript: """
  {
    "objectIDs": args.edges.filter(r, r.node.lang.contains("en-US")).map(r, r.node.id)
  }
""""
```

## Tailor Platform extensions

In addition, the Tailor platform provides useful extensions and supports optional types.

### `compact`

Accepts a map and returns a new one that excludes the entries that have null values.

```javascript
compact({ a: 1, b: null });
// → { "a": 1 }
```

### `get`

Provides [safe navigation](https://en.wikipedia.org/wiki/Safe_navigation_operator).
Accepts an object/array, a path, and fallback value.

```javascript
// args is { "input": { "query": { "some": "thing" } } }
get(args.input.query.date);
// → null

// args is { "input": { "query": { "date": "2023-01-01" } } }
get(args.input.query.date);
// → "2023-01-01"

// args is { "input": { "query": { "some": "thing" } } }
get(args.input.query.date, "1996-10-03");
// → "1996-10-03"
```

### `intersect`

Accepts two arrays and returns an array which contains the elements found in both.
Drops `null` values.

```javascript
intersect([1, 2, 3, null], [null, 3, 4, 5]);
// → [3]

intersect(["a", "b", "c"], ["c", "z", "b"]);
// → ["b", "c"]
```

### `makeMap`

Accepts an array and generates a map from it.

```javascript
makeMap(["a", 1, "b", 2]);
// → { "a": 1, "b": 2 }
```

### `uuidgen`

Generates a UUID v4 string.

```javascript
uuidgen();
// → 4f88b002-859f-4f59-b6fd-521c75041b13
```

### `ifThen`

Returns a specific value based on evaluation.

Accepts a condition, a true value and false value. If the condition evaluates to true, the true value is returned. Otherwise, the false value is returned.

```javascript
// args is 'x = 5, y = 7'
ifThen(x < y, x, y);
// → 5

// args is 'x = 5, y = 7'
ifThen(x > y, x, y);
// → 7

// args is 'x = 5, y = 7'
ifThen(x > y, x);
// → null
```

### `isNull`

Evaluates whether input is null and returns true or false.

```javascript
// args is { "input": { "query": { "some": "thing" } } }
isNull(args.input.query.some);
// → false

// args is { "input": { "query": { "some": null } } }
isNull(args.input.query.some);
// → true
```

### Optional types

With optional types, you can safely handle missing values in your scripts. This is especially useful for scenarios like:

- Checking if a value exists before performing an operation
- Providing default values for missing data
- Writing cleaner and more predictable expressions

```javascript
// args is { "field": { "array_field": ["value1", "value2"] } }
args.?field.?array_field[?0].orValue("default_value")
// → "value1"
```
