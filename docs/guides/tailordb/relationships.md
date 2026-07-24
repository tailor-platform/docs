---
doc_type: guide
---

# Relationship Field

TailorDB allows you to define relationships between types in your GraphQL schema through the `Relationships` field.
This enables you to express type associations directly in your schema, creating a seamless experience for querying related data through natural expressions such as foreign key references and list retrievals.
By using relationship fields, you can build more intuitive and maintainable GraphQL schemas.

## Configuration

The following table describes the available configuration options:

The SDK uses `db.uuid().relation()` to define relationships with automatic index and foreign key constraints:

| Option        | Description                                                                 | Required |
| ------------- | --------------------------------------------------------------------------- | -------- |
| `type`        | Relationship type: `"1-1"` for one-to-one, `"n-1"` for many-to-one          | ✅       |
| `toward.type` | Referenced Type                                                             | ✅       |
| `toward.key`  | Referenced field name (defaults to `"id"`)                                  | ⬜       |
| `toward.as`   | Custom name for accessing the related type from this type                   | ⬜       |
| `backward`    | Custom name for accessing this type from the related type (for 1:N queries) | ⬜       |

| Attribute     | Description                                                    | Required |
| ------------- | -------------------------------------------------------------- | -------- |
| `src_field`   | Source field name (field in the current Type)                  | ✅       |
| `ref_type`    | Referenced Type name                                           | ✅       |
| `ref_field`   | Referenced field name                                          | ✅       |
| `array`       | Set to `true` for 1:N relationships (multiple related records) | ⬜       |
| `description` | Field description                                              | ⬜       |

| Attribute     | Description                                                    | Required |
| ------------- | -------------------------------------------------------------- | -------- |
| `SrcField`    | Source field name (field in the current Type)                  | ✅       |
| `RefType`     | Referenced Type name                                           | ✅       |
| `RefField`    | Referenced field name                                          | ✅       |
| `Array`       | Set to `true` for 1:N relationships (multiple related records) | ⬜       |
| `Description` | Field description                                              | ⬜       |

## Constraints

When implementing relationships, ensure:

- The field specified in `ref_field` must have an `index` set.
- For 1:1 relationships, the referenced field must have `unique` specified.
- For 1:N relationships, the referenced field must not have `unique` specified.

## Examples

### 1:1 Relationship

In a 1:1 relationship, each record in Type A can be associated with at most one record in Type B.

```typescript
import { db } from "@tailor-platform/sdk";

export const species = db.table("Species", "Species data schema", {
  name: db.string().description("Name of the species").required(),
  ...db.fields.timestamps(),
});
export type species = typeof species;

export const character = db.table("Character", "Character data schema", {
  name: db.string().description("Name of the character").required(),
  speciesId: db
    .uuid()
    .description("Species ID of the character")
    .relation({
      type: "1-1",
      toward: { type: species, as: "species" },
    }),
  ...db.fields.timestamps(),
});
export type character = typeof character;
```

```sh
  resource "tailor_tailordb_type" "character" {
    workspace_id = tailor_workspace.example.id
    namespace    = tailor_tailordb.example.namespace
    name         = "Character"
    description  = "Character data schema"

    fields = {
      name = {
        type        = "string"
        description = "Name of the character"
        required    = true
      }
      speciesID = {
        type           = "uuid"
        description    = "Species ID of the character"
        index          = true
        foreign_key    = {
          type = "Species"
        }
      }
    }

    relationships = {
      species = {
        ref_type = "Species"
        ref_field = "id"
        src_field = "speciesID"
        description = "Species of the character"
      }
    }
  }
```

This relationship can be queried as follows:

```graphql
query character {
  character(id: "4c2429c8-b923-490f-a738-04e671896e9d") {
    name
    speciesID
    species {
      id
      name
    }
  }
}
```

### 1:N Relationship

In a 1:N relationship, each record in Type A can be associated with multiple records in Type B.

```typescript
import { db } from "@tailor-platform/sdk";

export const species = db.table("Species", "Species data schema", {
  name: db.string().description("Name of the species").required(),
  ...db.fields.timestamps(),
});
export type species = typeof species;

export const character = db.table("Character", "Character data schema", {
  name: db.string().description("Name of the character").required(),
  speciesId: db
    .uuid()
    .description("Species ID of the character")
    .relation({
      type: "n-1",
      toward: { type: species },
      backward: "characters", // Access characters from Species
    }),
  ...db.fields.timestamps(),
});
export type character = typeof character;
```

With the `backward` option, you can query characters from the Species type. The SDK automatically handles the 1:N relationship configuration.

```sh
  resource "tailor_tailordb_type" "species" {
    workspace_id = tailor_workspace.example.id
    namespace    = tailor_tailordb.example.namespace
    name         = "Species"
    description  = "Species data schema"

    fields = {
      name = {
        type        = "string"
        description = "Name of the species"
        required    = true
      }
    }

    relationships = {
      characters = {
        ref_type = "Character"
        ref_field = "speciesID"
        src_field = "id"
        array = true
        description = "Characters of the species"
      }
    }
  }
```

This relationship can be queried as follows:

```graphql
query species {
  species(id: "01219d7c-b8e3-44c0-845e-4871e8f02366") {
    name
    characters {
      edges {
        node {
          name
        }
      }
    }
  }
}
```

## Advanced Usage

### Nested Relationship Queries

You can query deeply nested relationships by chaining relationship fields:

```graphql
query getSpeciesWithCharactersAndItems {
  species(id: "01219d7c-b8e3-44c0-845e-4871e8f02366") {
    name
    characters {
      edges {
        node {
          name
          items {
            edges {
              node {
                name
                type
              }
            }
          }
        }
      }
    }
  }
}
```

&#x20;There are limitations to nesting depth, which may impact performance.

### Pagination and Filtering

When querying relationships that return multiple records, you can use pagination and filtering options:

```graphql
query getSpeciesWithFilteredCharacters {
  species(id: "01219d7c-b8e3-44c0-845e-4871e8f02366") {
    name
    characters(first: 5, filter: { name: { contains: "A" } }) {
      edges {
        node {
          name
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
```

This query retrieves the first 5 characters whose names contain the letter "A" for the specified species, along with pagination information.
