---
doc_type: guide
---

# Indexes

The `indexes` field allows you to define multiple indexes for a given type.
By adding this field, you can enable the use of several indexes as well as set uniqueness constraints across multiple fields.
This functionality is especially useful for applications that require efficient data management through multiple indexes.

For instance, consider the definition of the `titleAndSku` index as follows:

```typescript {{ title: 'tailordb/product.ts' }}
db.table("Product", {
  title: db.string(),
  sku: db.string(),
}).indexes({
  fields: ["title", "sku"],
  name: "titleAndSku",
  unique: true,
});
```

Within the `.indexes()` configuration, you can specify the fields to be included in the index using `fields`, and provide a `name` for the index.
In the example provided, we've named the index `titleAndSku`, but this name is flexible and can be customized as needed.

Furthermore, the `unique` attribute specifies the constraint for multiple fields to be unique.
Here, it signifies that each `title` and `sku` pairing must be distinct within the Product type, thereby preventing duplicate entries in the dataset.

For instance, consider the definition of the `title_and_sku` index as follows:

```sh {{ title: 'tailordb_product.tf' }}
resource "tailor_tailordb_type" "product" {
	workspace_id = tailor_workspace.ims.id
	namespace    = tailor_tailordb.ims.namespace
	name         = "Product"
	description  = "Product data schema"

	indexes = {
		title_and_sku = {
			field_names = ["title", "sku"]
			unique = true
		}
    }
}
```

Within the `indexes` configuration, you can specify the name of a composite index key using `field_names`, which identifies the fields to be included in the index.
In the example provided, we've named the index `title_and_sku`, but this name is flexible and can be customized as needed.

Furthermore, the `unique` attribute specifies the constraint for multiple fields to be unique.
Here, it signifies that each `title` and `sku` pairing must be distinct within the Product type, thereby preventing duplicate entries in the dataset.

For instance, consider the definition of the `titleAndSku` index as follows:

Within the `Indexes` configuration, you can specify the name of a composite index key using `FieldNames`, which identifies the fields to be included in the index.
In the example provided, we've named the index `titleAndSku`, but this name is flexible and can be customized as needed.

Furthermore, the `Unique` attribute specifies the constraint for multiple fields to be unique.
Here, it signifies that each `title` and `sku` pairing must be distinct within the Product type, thereby preventing duplicate entries in the dataset.

**Caveat**:
Enum type is not supported for the multiple indexes field.
