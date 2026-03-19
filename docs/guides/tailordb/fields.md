---
doc_type: guide
---

# Fields in schema

As explained in the [Basic Structure of a Schema](/guides/tailordb/overview#basicstructureofaschema), each field of the data model (corresponding to columns in a relational database) is defined in the `fields` property of the schema file.

Here, we will discuss how to configure the schema within the `Fields` property.

## Properties of `Fields`

As shown in the example schema below, `Fields` contains the following structure

- Field name: the name for the field (required).
- `Description`: the description of the field in String. This will appear in GraphQL SDL and Playground (required).
- `Type`: the data type of the field (required). Have to be one of [Data types](/guides/tailordb/fields#datatype)

With just this, the GraphQL API is automatically generated.

```typescript {{title: "tailordb/product.ts"}}
import { db } from "@tailor-platform/sdk";

export const product = db.type("Product", "Product data schema", {
  title: db.string().description("Title of the product").index(),
  description: db.string().description("Description of the product"),
  ...db.fields.timestamps(),
});
export type product = typeof product;
```

```sh {{title: "product.tf"}}
  resource "tailor_tailordb_type" "product" {
    workspace_id = tailor_workspace.ims.id
    namespace    = tailor_tailordb.ims.namespace
    name         = "Product"
    description  = "Product data schema"

    settings = {
      draft = true
    }

    fields = {
      title = {
    	  type        = "string"
    	  description = "Title of the product"
    	  index       = true
    	  required    = true
      }
      description = {
    	  type        = "string"
    	  description = "Description of the product"
      }
    }
    type_permission = local.permission_everyone
  }
```

## Naming rules

Field names should use lower camel case (e.g., priceTotal) and must not contain spaces or special characters. Therefore, snake case naming (e.g., price_total) is not allowed.
Use only alphabetic characters (A-Z, a-z) and numeric characters (0-9), and do not start with a numeric character.
Even if the field name violates this rule, the API is still auto-generated, but it does not work correctly.

## Data type

```typescript
// Example: set data type as string
name: db.string();
```

The SDK provides the following field type methods:

| SDK Method      | Type     | Description               |
| --------------- | -------- | ------------------------- |
| `db.string()`   | String   | String value              |
| `db.uuid()`     | UUID     | UUID formatted string     |
| `db.int()`      | Integer  | 32-bit integer            |
| `db.float()`    | Float    | 128-bit decimal           |
| `db.enum()`     | Enum     | Enumerated values         |
| `db.bool()`     | Boolean  | Boolean value             |
| `db.time()`     | Time     | Time in HH:MM format      |
| `db.date()`     | Date     | Date in YYYY-MM-DD format |
| `db.datetime()` | DateTime | ISO 8601 datetime         |
| `db.object()`   | Nested   | Nested object fields      |

```sh
  // Example: set data type as string
  name = {
  	type = "string"
  }
```

Visit [tailordb types](https://registry.terraform.io/providers/tailor-platform/tailor/latest/docs/resources/tailordb_type) to learn more about the types.

Here are the available list of data types in TailorDB.
For details about the filter, refer to [TailorDB Filter](/guides/tailordb/filters) specification.

| Predefined Data Type | Type Description                                                                                                                            | Available Filters                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| string               | String                                                                                                                                      | eq, ne, in, nin, contains, regex           |
| uuid                 | String of of 32 hexadecimal digits as defined in [RFC4122](https://www.ietf.org/rfc/rfc4122.txt) ex. `f81d4fae-7dec-11d0-a765-00a0c91e6bf6` | eq, ne, in, nin                            |
| integer              | 32-bit integer                                                                                                                              | eq, ne, lt, lte, gt, gte, between, in, nin |
| float                | 128-bit decimal-based floating-point number                                                                                                 | eq, ne, lt, lte, gt, gte, between, in, nin |
| enum                 | Enum. Values are defined in `values` field                                                                                                  | eq, ne, in, nin                            |
| bool                 | Boolean                                                                                                                                     | eq, ne                                     |
| time                 | String in the format `HH:MM` ex. "12:45"                                                                                                    | eq, ne, lt, lte, gt, gte, between, in, nin |
| date                 | String in the format `YYYY-MM-DD` ex. "2022-10-10"                                                                                          | eq, ne, lt, lte, gt, gte, between, in, nin |
| datetime             | String in the ISO 8601 format `yyyy-MM-ddTHH:mm:ss` ex. "2024-06-25T19:34:42Z"                                                              | eq, ne, lt, lte, gt, gte, between, in, nin |
| nested               | A type with nested fields. Nested fields are defined in `fields` field                                                                      | ----                                       |

Additionally, you can configure a field to automatically generate sequential numbers using the `serial` property. See [Serial](#serial) for more details.

As for the `Type` field, set one of the following data types as `tailordb.#<field_type>`.

For example, to set the `TypeString` data type to the `name` field, use the following setting:

Here are the available list of data types in TailorDB.
For details about the filter, refer to [TailorDB Filter](/guides/tailordb/filters) specification.

| Predefined Data Type | Type Description                                                                                                                            | Available Filters                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| TypeString           | String                                                                                                                                      | eq, ne, in, nin, contains, regex           |
| TypeUUID             | String of of 32 hexadecimal digits as defined in [RFC4122](https://www.ietf.org/rfc/rfc4122.txt) ex. `f81d4fae-7dec-11d0-a765-00a0c91e6bf6` | eq, ne, in, nin                            |
| TypeInt              | 32-bit integer                                                                                                                              | eq, ne, lt, lte, gt, gte, between, in, nin |
| TypeFloat            | 128-bit decimal-based floating-point number                                                                                                 | eq, ne, lt, lte, gt, gte, between, in, nin |
| TypeEnum             | Enum. Values are defined in `values` field                                                                                                  | eq, ne, in, nin                            |
| TypeBool             | Boolean                                                                                                                                     | eq, ne                                     |
| TypeTime             | String in the format `HH:MM` ex. "12:45"                                                                                                    | eq, ne, lt, lte, gt, gte, between, in, nin |
| TypeDate             | String in the format `YYYY-MM-DD` ex. "2022-10-10"                                                                                          | eq, ne, lt, lte, gt, gte, between, in, nin |
| TypeDateTime         | String in the ISO 8601 format `yyyy-MM-ddTHH:mm:ss` ex. "2024-06-25T19:34:42Z"                                                              | eq, ne, lt, lte, gt, gte, between, in, nin |
| TypeNested           | A type with nested fields. Nested fields are defined in `fields` field                                                                      | ----                                       |

Additionally, you can configure a field to automatically generate sequential numbers using the `Serial` property. See [Serial](#serial) for more details.

## Auto-generated GraphQL data fields

Besides the fields specified within the fields parameter, TailorDB automatically generates the following system fields for each Type in the GraphQL Schema:

Please be aware that these names are reserved for system use and cannot be employed as user-defined field names.

| GraphQL field name | Data Type | Description                                                                                 |
| ------------------ | --------- | ------------------------------------------------------------------------------------------- |
| `id`               | UUID      | UUID formatted unique identifier of the resource. Acts as the primary key of the resources. |
| `createdBy`        | createdBy | ID of the user and the user's organization who created the resource.                        |
| `updatedBy`        | updatedBy | ID of the user and the user's organization who updated the resource.                        |

## Supporting fields

Describing more complex data models is also simple. By adding the following optional parameters to the field, you can set default values, array types, relations to other models, unique keys or foreign keys, and input value validation, among other things.

### Required

If this field is set, the value must be provided.
The data type of the field is `Boolean`.

### Array

If this field is set, the field value will be an array.
The data type of the field is `Boolean`.

### Unique / Index

If these fields are set to true, the field value will be subject to uniqueness constraints.
However, you can set only the index option to true when the field is not unique.
To enforce uniqueness, both options must be enabled.
The data type of the fields are both `Boolean`.

### AllowedValues (used only in Enum)

If the field data type is `TypeEnum`, this can be used to define the enumerated values.
The data type of the field is `String`. You can describe each defined value using the `Description` property.

```typescript
inventoryType: db.enum([
  { value: "INVENTORY", description: "INVENTORY type" },
  { value: "NON_INVENTORY", description: "NON_INVENTORY type" },
  { value: "SERVICE", description: "SERVICE type" },
]).description("Different categories of product");
```

```sh
  inventoryType = {
  	type        = "enum"
  	description = "Different categories of product"
  	allowed_values = [
  		{
  			value       = "INVENTORY"
  			description = "INVENTORY type"
  		},
  		{
  			value       = "NON_INVENTORY"
  			description = "NON_INVENTORY type"
  		},
  		{
  			value       = "SERVICE"
  			description = "SERVICE type"
  		}
  	]
  }
```

### Fields (used only in Nested)

If the field data type is `TypeNested`, use this to define the nested fields within the structure.
The data type of the field is the same as that of the parent field.

### SourceId (used for linking other Type)

If you want to link the data from different type, you can use the SourceId field to create the link.
The data type of `SourceId` field is `UUID`.

#### Example

```typescript
  // Define a relation to another type
  supplierId: db.uuid().description("UUID of type Supplier").index(),
  supplier: db.relation("Supplier", "supplierId").description("Link to the model Supplier"),
```

```sh
  species = {
  	type        = "Species"
  	description = "Species of the character"
  	source      = "speciesID"
  }
  speciesID = {
  	type        = "uuid"
  	description = "Species ID of the character"
  	index       = true
  	foreign_key = {
  		type  = "Species"
  		field = "id"
  	}
  }
```

### Foreign key

Foreign key constraints are automatically applied when using `db.relation()`. For explicit foreign key configuration:

```typescript
// Foreign key with relation
supplierId: db.uuid().description("UUID of type Supplier").index(),
supplier: db.relation("Supplier", "supplierId"),
```

Foreign key `type` and `field` can be configured when the source field is set.
If these fields are specified, the field value will be subject to foreign key constraints.
The `field` is optional and defaults to id. To improve query performance, enable indexing on foreign key fields by setting index to true.

The data type of the foreign key `type` and `field` is `string`.

#### Example

```sh
// add foreign key constraints
speciesID = {
	type        = "uuid"
	description = "Species ID of the character"
	foreign_key = {
		type  = "Species"
		field = "id" // optional. if you don't set "field", "id" is used by default.
	}
}
```

`ForeignKey`,`ForeignKeyType` and `ForeignKeyField` can be configured in case `SourceId` field is set.
If these fields are set, the field value will be subject to foreign key constraints.
For this to take effect, both `ForeignKey` and `ForeignKeyType` must be enabled.
`ForeignKeyField` is an _optional_ field where you can specify `ForeignKeyType`'s field. By default, it is `id`.
To improve query performance, enable indexing on foreign key fields by setting index to true.

The data type of `ForeignKey` is `Boolean`, that of `ForeignKeyType` and `ForeignKeyField` is `String`.

#### Example

### Validate

If this field is set, validation rules will be applied to the field value.
Validations are evaluated after all properties are evaluated. For example, hooks will always run first then validation.
The data type of the field is an array of maps, with `Expr` and `Action` defined. Learn more in [Data Validations](/guides/tailordb/validations).

### Hooks

If this field is set, the field value is computed using the given expression.
Hooks are evaluated before validation.
Learn more in [Hooks](/guides/tailordb/hooks).

### Serial

If this field is set, the field value will be automatically assigned a sequential number when a new record is created.
The data type of the field can be either `Integer` or `String`.
When a Serial Field is specified, this field cannot be set as required.

The sequence part is represented as a number (or its representation in different bases).
During record creation, the Serial Field gets a value from a sequence generator.
However, if a value is already specified for the field, the Serial Field won't overwrite it.

For string fields with Format specified, the formatted string is applied.

The Serial configuration includes the following options:

- `Start`: The starting number for the sequence (required).
- `MaxValue`: The maximum value for the sequence (optional).
- `Format`: A printf notation string to format the sequence number (optional, only for String type fields).
  - The format must follow the C printf style, containing exactly one conversion specifier (`%d`, `%o`, `%x`, or `%X`), optionally preceded by a width specifier, with any other characters allowed. For example, `"No:%03d"` with a value of 5 would display as `No:005`.
  - Format must be within 32 characters.

If Start or MaxValue is changed, the sequence generator is altered.
Format changes don't alter the sequence generator.
Serial Fields cannot be used in nested fields.

```typescript
serial: db.string()
  .description("Serial Number of the episode")
  .index()
  .unique()
  .serial({ start: 1000, maxValue: 9999, format: "EP#%04d" });
```

```sh
  serial = {
  	type        = "string"
  	description = "Serial Number of the episode"
  	index       = true
  	unique      = true
  	serial      = {
  		start    = 1000
  		max_value = 9999
  		format   = "EP#%04d"
  	}
  }
```

#### Example

```typescript {{title: "tailordb/episode.ts"}}
import { db } from "@tailor-platform/sdk";

export const episode = db.type("Episode", "Episode data schema", {
  title: db.string().description("Title of the episode"),
  serial: db
    .string()
    .description("Serial Number of the episode")
    .index()
    .unique()
    .serial({ start: 1000, maxValue: 9999, format: "EP#%04d" }),
  ...db.fields.timestamps(),
});
export type episode = typeof episode;
```

```graphql
# GraphQL mutation
mutation createEpisode($title: String!) {
  createEpisode(input: { title: $title }) {
    id
    title
    serial
  }
}
```

```json
# Result
{
  "data": {
    "createEpisode": {
      "id": "b25f81f9-3409-4c47-8ad8-0e8720f1e341",
      "title": "hello3",
      "serial": "EP#1000"
    }
  }
}
```

```sh
  // TailorDB config
  resource "tailor_tailordb_type" "episode" {
  	workspace_id = tailor_workspace.example.id
  	namespace    = tailor_tailordb.example.namespace
  	name         = "Episode"
  	description  = "Episode data schema"

  	fields = {
  		title = {
  			type        = "string"
  			description = "Title of the episode"
  			required    = true
  		}
  		serial = {
  			type        = "string"
  			description = "Serial Number of the episode"
  			index       = true
  			unique      = true
  			serial      = {
  				start    = 1000
  				max_value = 9999
  				format   = "EP#%04d"
  			}
  		}
  	}
  }
```

```graphql
# GraphQL mutation
mutation createEpisode($title: String!) {
  createEpisode(input: { title: $title }) {
    id
    title
    serial
  }
}
```

```json
# Result
{
	"data": {
		"createEpisode": {
			"id": "b25f81f9-3409-4c47-8ad8-0e8720f1e341",
			"title": "hello3",
			"serial": "EP#1000"
		}
	}
}
```

```graphql
# GraphQL mutation
mutation createEpisode($title: String!) {
  createEpisode(input: { title: $title }) {
    id
    title
    serial
  }
}
```

```json
# Result
{
	"data": {
		"createEpisode": {
			"id": "b25f81f9-3409-4c47-8ad8-0e8720f1e341",
			"title": "hello3",
			"serial": "EP#1000"
		}
	}
}
```
