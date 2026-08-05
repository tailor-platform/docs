---
doc_type: guide
---

# Hooks (Calculated Field)

`Hooks` is a feature in Tailor Platform that offers functionality similar to calculated fields in traditional relational databases.\
When a record is created or modified, Hooks automatically update specified field values based on your expressions.

These expressions serve several purposes:

1. Performing calculations:

You can perform calculations using other fields within the same record. For example, a field like `totalPrice` can be configured to automatically calculate the product of `price` and `quantity` fields.

2. Adding user context:

Hooks allow the addition of the current invoker's context to the record. For instance, a field like `createdById` can be populated with the `invoker.id`.\
Additionally, you can utilize invoker attributes, an array of UUIDs configured in the `AttributesFields` in the Auth service. A typical use case for `invoker.attributes` involves validation. Refer to this [example](/guides/tailordb/validations#exampledemonstratinghowtouseuserattributes).

Furthermore, the field updates itself whenever a new record is created or an existing one is updated.\
This ensures data consistency without manual recalculations, similar to calculated fields in a database, and helps you avoid writing complex logic in [Resolver](/guides/resolver).

## Hooks Properties

The following table shows all available hook properties and their scripting language support:

| Property      | Scripting Language                        | Trigger Event   | Description                                                                                                                                           |
| ------------- | ----------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create`      | [JavaScript](/reference/api/js-scripting) | Record creation | Triggered when a new record is created. You can use `_value` to refer to the current field value and `_data` to refer to the entire record            |
| `update`      | [JavaScript](/reference/api/js-scripting) | Record update   | Triggered when the target record is updated. You can use `_value` to refer to the current field value and `_data` to refer to the entire record       |
| `create_expr` | [CEL](/reference/api/cel-scripting)       | Record creation | Triggered when a new record is created. You can use `_value` to refer to the current field value and `_value.abc` to refer to the specific field      |
| `update_expr` | [CEL](/reference/api/cel-scripting)       | Record update   | Triggered when the target record is updated. You can use `_value` to refer to the current field value and `_value.abc` to refer to the specific field |

## Examples

### JavaScript

```js {{ title: "example" }}
hooks = {  // if shopifyID is null, set status to 'awaiting_payment', else set status to the current value
  create = "_data.shopifyID == null ? 'awaiting_payment' : _value"
}
```

#### CEL &#x20;

```js {{ title: "example" }}
hooks = {  // if shopifyID is null, set status to 'awaiting_payment', else set status to the current value
  create_expr = "_value.shopifyID == null ? 'awaiting_payment' : '_value'"
}
```

#### Compute the total price of an item

```typescript {{ title: "order.ts"}}
import { db } from "@tailor-platform/sdk";

export const order = db
  .table("Order", {
    price: db.int().description("Unit price of a certain product"),
    quantity: db.int().description("Order quantity of a certain product"),
    totalPrice: db.int().description("Total price of a certain product"),
  })
  .hooks({
    create: ({ input }) => ({ totalPrice: input.price * input.quantity }),
    update: ({ input, oldRecord }) => ({
      totalPrice: (input.price ?? oldRecord.price) * (input.quantity ?? oldRecord.quantity),
    }),
  });
```

Field-level hooks can't read other fields, so computing `totalPrice` from `price` and `quantity` requires a type-level hook (`db.table().hooks(...)`) instead.

```sh {{ title: "order.tf"}}
  price = {
    type        = "integer"
    description = "Unit price of a certain product"
  }
  quantity = {
    type        = "integer"
    description = "Order quantity of a certain product"
  }
  totalPrice = {
    type        = "integer"
    description = "Total price of a certain product"
    hooks = {
      create = "_data.price * _data.quantity"
      update = "_data.price * _data.quantity"
    }
  }
```

With such hooks in place, the totalPrice field will be computed and stored whenever the order is created or changed.

#### Add user context to the Supplier model

```typescript {{ title: "supplier.ts"}}
import { db } from "@tailor-platform/sdk";

export const supplier = db.table("Supplier", {
  createdById: db
    .uuid()
    .description("User ID of the logged in user")
    .hooks({
      create: ({ invoker }) => invoker?.id ?? "",
    }),
});
```

```sh {{ title: "supplier.tf"}}
  createdById = {
    type        = "uuid"
    description = "User ID of the logged in user"
    hooks = {
      create = "user.id"
    }
  }
```

#### Set a default value to a field

```typescript {{ title: "order.ts"}}
import { db } from "@tailor-platform/sdk";

export const order = db.table("Order", {
  quantity: db
    .int()
    .description("Order quantity of a certain product")
    .hooks({
      create: ({ input }) => input ?? 2,
    }),
});
```

For a plain, unconditional default like this one, prefer `.default(2)` on the field instead — it also makes the field optional in the create input. Use a hook when the default depends on other fields or the invoker (see [Conditional default values](#conditional-default-values) below).

```sh {{ title: "order.tf"}}
  quantity: {
    type        = "integer"
    description = "Order quantity of a certain product"
    hooks = {
      create = "_value != null ? _value : 2"
    }
  }
```

## Evaluation order

### User input

Hooks run after input evaluation, having the consequence that any passed value may be overwritten by a hook's result, depending on the type of the hooks.

#### Example

```typescript {{ title: "order.ts"}}
import { db } from "@tailor-platform/sdk";

export const order = db
  .table("Order", {
    price: db.int().description("Unit price of a certain product"),
    quantity: db.int().description("Order quantity of a certain product"),
    totalPrice: db.int().description("Total price of a certain product"),
  })
  .hooks({
    create: ({ input }) => ({ totalPrice: input.price * input.quantity }),
    update: ({ input, oldRecord }) => ({
      totalPrice: (input.price ?? oldRecord.price) * (input.quantity ?? oldRecord.quantity),
    }),
  });
```

```sh {{ title: "order.tf"}}
  price = {
    type        = "integer"
    description = "Unit price of a certain product"
  }
  quantity = {
    type        = "integer"
    description = "Order quantity of a certain product"
  }
  totalPrice = {
    type        = "integer"
    description = "Total price of a certain product"
    hooks = {
      create = "_data.price * _data.quantity"
      update = "_data.price * _data.quantity"
    }
  }
```

When passing totalPrice = `100`, price = `5`, and quantity = `10` as inputs, `50` is stored on the `totalPrice` field.

### Validate vs Hooks

Validations are run after hooks.

For an Order model, if price \* quantity is less than 100, the record is created and the computed total price is stored.
If the total exceeds 100, validation fails and the record is not created.

```typescript {{ title: "order.ts"}}
import { db } from "@tailor-platform/sdk";

export const order = db
  .table("Order", {
    price: db.int().description("Unit price of a certain product"),
    quantity: db.int().description("Order quantity of a certain product"),
    totalPrice: db
      .int()
      .description("Total price of a certain product")
      .validate(({ value }) =>
        value >= 100 ? "totalPrice value must be less than 100" : undefined,
      ),
  })
  .hooks({
    create: ({ input }) => ({ totalPrice: input.price * input.quantity }),
    update: ({ input, oldRecord }) => ({
      totalPrice: (input.price ?? oldRecord.price) * (input.quantity ?? oldRecord.quantity),
    }),
  });
```

```sh {{ title: "order.tf"}}
  price = {
    type        = "integer"
    description = "Unit price of a certain product"
  }
  quantity = {
    type        = "integer"
    description = "Order quantity of a certain product"
  }
  totalPrice = {
    type        = "integer"
    description = "Total price of a certain product"
    hooks = {
      create = "_data.price * _data.quantity"
      update = "_data.price * _data.quantity"
    }
    validate = [
      {
        expr   = "_value < 100"
        action = "deny"
      }
    ]
  }
```

## Advanced usage

### createdAt, updatedAt field

The datetime each record was created and updated can be stored as follows

```typescript {{ title: "order.ts"}}
import { db } from "@tailor-platform/sdk";

export const order = db
  .table("Order", {
    createdAt: db.datetime().description("The time when this record is created"),
    updatedAt: db.datetime().description("The time when this record is updated"),
  })
  .hooks({
    // `now` is the same Date instance across every hook in the same operation.
    create: ({ now }) => ({ createdAt: now, updatedAt: now }),
    update: ({ now }) => ({ updatedAt: now }),
  });
```

Or use the built-in timestamps helper:

```typescript {{ title: "order.ts"}}
import { db } from "@tailor-platform/sdk";

export const order = db.table("Order", {
  ...db.fields.timestamps(),
});
```

`db.fields.timestamps()` adds non-null `createdAt` and `updatedAt` fields with this same behavior built in — both are populated on create, and `updatedAt` is refreshed on every update. Provided values are preserved (useful for seeding historical timestamps).

```sh {{ title: "order.tf"}}
  createdAt = {
    type        = "datetime"
    description = "The time when this record is created"
    hooks = {
      create = "(new Date()).toISOString()"
    }
  }
  updatedAt = {
    type        = "datetime"
    description = "The time when this record is updated"
    hooks = {
      update = "(new Date()).toISOString()"
    }
  }
```

In this example, the `createdAt` field is set only on create, while `updatedAt` is set on both create and update.

When the record is created, the current datetime value is stored in both the `createdAt` and `updatedAt` fields.

When the record is updated, the value in the `createdAt` field remains unchanged, while the `updatedAt` field is updated with the current datetime.

### Conditional default values

Hooks can be used to set the default value of a field, especially when it depends on dynamic conditions.

In this example, the default value of the field `price` is determined by the value of the `type` field.

```typescript {{ title: "order.ts"}}
import { db } from "@tailor-platform/sdk";

export const order = db
  .table("Order", {
    type: db
      .enum([
        { value: "ITEMA", description: "Item A" },
        { value: "ITEMB", description: "Item B" },
      ])
      .description("Item category"),
    price: db.int().description("Unit price of a certain product"),
  })
  .hooks({
    create: ({ input }) => ({ price: input.type === "ITEMA" ? 100 : null }),
  });
```

This needs a type-level hook because it reads the `type` field to decide `price` — field-level hooks can't see other fields.

```sh {{ title: "order.tf"}}
  type = {
    type        = "enum"
    description = "Item category"
    allowed_values : [
      {
        value       = "ITEMA"
        description = "Item A"
      },
      {
        value       = "ITEMB"
        description = "Item B"
      }
    ]
  }
  price = {
    type        = "integer"
    description = "Unit price of a certain product"
    hooks = {
      create = "_data.type == 'ITEMA' ? 100 : null"
    }
  }
```

In this example, the `price` field is evaluated only on create events, and if the type is `ITEMA`, then the value `100` is applied to the `price` field.

However, if the type is `ITEMB`, no value is applied to the `price` field.

Additionally, on the update event, regardless of whether the type is `ITEMA` or `ITEMB`, no value is applied.
