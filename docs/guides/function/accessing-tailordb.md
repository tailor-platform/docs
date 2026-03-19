---
doc_type: guide
---

# Accessing TailorDB

In order to access TailorDB from Function service, you need to instantiate the `Client` object from the `tailordb` package.
`tailordb` exists in the Function service environment by default, so you can use it without any additional installation.
Please specify the `namespace` of the TailorDB you want to connect to when creating the `Client` object.

Here is the `Client` interface:

```ts
export interface Client {
  connect(): Promise<void>;
  end(): Promise<void>;
  queryObject<T>(sql: string, args?: readonly any[]): Promise<{ rows: T[] }>;
  createTransaction(name: string): Transaction;
  new (config?: { namespace?: string }): Client;
}

type Transaction = {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  queryObject<T>(sql: string, args?: readonly any[]): Promise<{ rows: T[] }>;
};
```

Please refer to the [Supported SQL queries](#supported-sql-queries) for more information on the SQL syntax supported in `Client.queryObject`.

## Sample codes to access TailorDB in JavaScript

### Getting data from TailorDB

```js {{ title: 'get_data_function.js' }}
globalThis.main = async function () {
  const client = new tailordb.Client({
    namespace: "ims",
  });

  await client.connect();
  const product = await client.queryObject("SELECT * FROM Product");
  await client.end();

  return {
    Product: product.rows,
  };
};
```

### Inserting data to TailorDB

```js {{ title: 'insert_data_function.js' }}
globalThis.main = async function (args) {
  const client = new tailordb.Client({
    namespace: "ims",
  });
  await client.connect();
  try {
    const millis = Date.now();
    const products = await client.queryObject("SELECT * FROM Product");
    const len = products.rows.length;
    if (len !== 0) {
      throw new Error(`The size of Product, expected:0 got:${len}`);
    }
    const fixtures = [
      `${millis} - Product 1`,
      `${millis} - Product 2`,
      `${millis} - Product 3`,
      `${millis} - Product 4`,
    ];
    const transaction = client.createTransaction("add_products");
    try {
      await transaction.begin();
      for (const i of fixtures) {
        const ret = await transaction.queryObject(`INSERT INTO Product (title) VALUES ('${i}')`);
      }
      await transaction.commit();
      const products = await client.queryObject(
        `SELECT * FROM Product WHERE title like '${millis}%'`,
      );
      const len = products.rows.length;
      if (len !== 4) {
        throw new Error(`The size of Product, expected:4 got:${len}`);
      }
      return {
        success: len === 4,
      };
    } catch (e) {
      throw new Error(`add_products failed with error:${e}\n${e.cause}`);
    }
  } finally {
    await client.end();
  }
};
```

## Deploy sample functions

### Directory Structure

Here's the sample directory structure for an SDK project.
Let's deploy the `insertData` resolver to Tailor Platform.
**Since we don't use npm packages in this example, we don't need to bundle the function.**

```sh {{ title: 'SDK directory structure' }}
.
├── tailor.config.ts
├── package.json
├── resolvers
│   └── insert-data.ts
└── tailordb
    └── product.ts
```

### Resolver Example

With SDK, you can use the Kysely query builder to access TailorDB in a type-safe manner.
Here's a sample SDK configuration for setting up a resolver that accesses TailorDB:

```typescript {{ title: 'insert-data.ts' }}
import { createResolver, t } from "@tailor-platform/sdk";
import { getDB } from "../generated/tailordb";

export default createResolver({
  name: "insertData",
  description: "sample mutation resolver",
  operation: "mutation",
  input: {
    title: t.string(),
  },
  body: async (context) => {
    const db = getDB("ims");
    const millis = Date.now();

    // Check if products already exist
    const existingProducts = await db.selectFrom("Product").selectAll().execute();

    if (existingProducts.length !== 0) {
      throw new Error(`The size of Product, expected:0 got:${existingProducts.length}`);
    }

    // Insert products using transactions
    const fixtures = [
      `${millis} - Product 1`,
      `${millis} - Product 2`,
      `${millis} - Product 3`,
      `${millis} - Product 4`,
    ];

    for (const title of fixtures) {
      await db.insertInto("Product").values({ title }).execute();
    }

    // Verify inserted products
    const products = await db
      .selectFrom("Product")
      .selectAll()
      .where("title", "like", `${millis}%`)
      .execute();

    return {
      success: products.length === 4,
    };
  },
  output: t.object({
    success: t.boolean().nullable(),
  }),
});
```

### TailorDB Example

To execute the function, you need to set up the Product table in TailorDB.

```typescript {{ title: 'product.ts' }}
import { db, auth } from "@tailor-platform/sdk";

export const product = db.type("Product", {
  title: db.string().description("Title of the product"),
  ...db.fields.timestamps(),
});
export type product = typeof product;
```

### Deployment

Let's deploy the function to Tailor Platform.

```sh
npx tailor deploy
```

## Supported SQL queries

Strictly speaking, the SQL statements here are executed via a proxy to TailorDB.
The SQL that can be issued is a subset of PostgreSQL, so the fundamental syntax follows PostgreSQL conventions.

### SELECT

#### Retrieve specific columns

```sql
SELECT "id", "name" FROM "Character";
```

#### Retrieve all columns

```sql
SELECT * FROM "Character";
```

#### Join tables

Only records where the user has `Read` permission for all joined records are returned.

Self-joins (joining the same table multiple times) are not supported.

```sql
SELECT * FROM "Character" JOIN "Species" ON "Character"."speciesID" = "Species"."id";
```

#### Use table aliases

You can specify aliases for table names to make queries more concise and readable. This is particularly useful in complex queries with multiple joins.

```sql
SELECT c.*, s.* FROM "Character" AS c LEFT JOIN "Species" AS s ON c."speciesID" = s."id";
```

You can also omit the `AS` keyword:

```sql
SELECT c."name", s."name" FROM "Character" c JOIN "Species" s ON c."speciesID" = s."id";
```

&#x20;Self-joins are not supported at this time. Assigning different aliases to the same table in the same query will result in an error.

#### Filter by condition

For specific supported operators, see `condition` in [Syntax](#syntax) section.

```sql
SELECT * FROM "Character" WHERE "name" = 'Alice';
```

#### Sort by column

As in PostgreSQL, when the order is omitted, the default is `ASC`.

`NULLS` cannot be specified, so null values are always treated as greater than non-null values.

```sql
SELECT * FROM "Character" ORDER BY "name" DESC;
```

#### Aggregate functions

You can use aggregate functions to perform calculations on sets of rows. The supported functions are `COUNT`, `SUM`, `AVG`, `MAX`, and `MIN`.

**COUNT function** - Count rows or non-null values in specific columns:

```sql
SELECT count(*), count(id), count(name), count(speciesID) FROM "Character";
```

**SUM function** - Calculate the sum of numeric values (Integer and Float fields only):

```sql
SELECT sum(age), sum(height) FROM "Character";
```

**AVG function** - Calculate the average of numeric values (Integer and Float fields only):

```sql
SELECT avg(age), avg(height) FROM "Character";
```

**MAX function** - Find the maximum value:

```sql
SELECT max(age), max(height) FROM "Character";
```

**MIN function** - Find the minimum value:

```sql
SELECT min(age), min(height) FROM "Character";
```

You can also use column aliases with any aggregate function:

```sql
SELECT count(*) as total, sum(age) as total_age, avg(height) as avg_height FROM "Character";
```

Aggregate functions with JOIN operations:

```sql
SELECT count(c.id), sum(c.age), avg(s.lifespan) FROM "Character" AS c LEFT JOIN "Species" AS s ON c.speciesID = s.id;
```

**Field type restrictions**

| Function | Allowed Field Types                                |
| -------- | -------------------------------------------------- |
| SUM      | Integer, Float                                     |
| AVG      | Integer, Float                                     |
| MAX      | Integer, Float, String, Enum, Date, Time, DateTime |
| MIN      | Integer, Float, String, Enum, Date, Time, DateTime |
| COUNT    | All field types                                    |

#### Group by columns

You can use the `GROUP BY` clause to group rows that have the same values in specified columns and perform aggregate calculations on each group.

```sql
SELECT "speciesID", COUNT(*) FROM "Character" GROUP BY "speciesID";
```

Filter groups using `HAVING`:

```sql
SELECT "speciesID", AVG("height") FROM "Character" GROUP BY "speciesID" HAVING COUNT(*) > 5;
```

For GraphQL-based aggregation queries in TailorDB, see [TailorDB Aggregation](/guides/tailordb/advanced-settings/aggregation).

#### Vector similarity search

You can use the `vector_similarity` function to sort records by similarity to a natural language query. This function is only available for fields that have been configured as Vector Fields in your TailorDB schema.

```sql
SELECT * FROM "Product" ORDER BY vector_similarity("description", 'What products are associated with A and B?') DESC LIMIT 5;
```

**Important notes:**

- If the specified field is not a Vector Field, an error will occur
- To retrieve the most similar records, be sure to explicitly use `DESC` in the `ORDER BY` clause
- For more information on setting up Vector Fields, see [Vector Search](/guides/tailordb/advanced-settings/vector-search)

#### Limit and offset the results

```sql
SELECT * FROM "Character" LIMIT 1 OFFSET 1;
```

#### Lock rows

```sql
SELECT * FROM "Character" FOR UPDATE;
```

### INSERT

#### Insert a single row

As in `TailorDB`, if no value is specified for `id`, a new UUID is automatically generated.

```sql
INSERT INTO "Starship" (
    "name",               -- String (text)
    "crew",               -- Int (int4)
    "length",             -- Float (float8)
    "isArmed",            -- Bool (bool)
    "status",             -- Enum (text)
    "serialNumber",       -- UUID (uuid)
    "manufactureDate",    -- Date (date)
    "maintenanceTime",   -- Time (time)
    "lastLaunchDateTime", -- DateTime (timestamptz)
    "hyperdriveRating",   -- Nested (jsonb)
    "manufacturers"       -- String Array (_text)
) VALUES (
    'Millennium Falcon',
    4,
    34.75,
    TRUE,
    'ACTIVE',
    'a845e77f-2bce-462a-9e25-8d9296c3545b',
    '1977-05-25',
    '22:00',
    '2019-12-20T00:00:00Z',
    '{"main": 0.5, "backup": 10.0}',
    ARRAY['Corellian Engineering Corporation']
);
```

#### Insert multiple rows

```sql
INSERT INTO "Character" ("name") VALUES ('Alice'), ('Bob');
```

#### Insert default values

With support for `DEFAULT`, fields can be explicitly omitted when values are automatically generated via Hooks, etc.

```sql
INSERT INTO "Character" ("name", "createdAt") VALUES ('Alice', DEFAULT);
```

When omitting all columns, `DEFAULT VALUES` can be used.

```sql
INSERT INTO "Character" DEFAULT VALUES;
```

#### Upsert

The conflict target (e.g., `id` in the example below) can only contain a single column.
Specify either `id` or a column with `Unique=true`.

```sql
INSERT INTO "Character" ("id", "name") VALUES ('a845e77f-2bce-462a-9e25-8d9296c3545b', 'Alice') ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name";
```

#### Return the inserted row

```sql
INSERT INTO "Character" ("name") VALUES ('Alice') RETURNING *;
```

### UPDATE

#### Update specific columns

```sql
UPDATE "Character" SET "name" = 'Alice' WHERE "id" = 'a845e77f-2bce-462a-9e25-8d9296c3545b';
```

#### Return the updated row

```sql
UPDATE "Character" SET "name" = 'Alice' WHERE "id" = 'a845e77f-2bce-462a-9e25-8d9296c3545b' RETURNING *;
```

#### Arithmetic updates

```sql
UPDATE "Starship" SET "crew" = "crew" + 5 WHERE "id" = 'a845e77f-2bce-462a-9e25-8d9296c3545b';
```

### DELETE

#### Delete rows

```sql
DELETE FROM "Character" WHERE "id" = 'a845e77f-2bce-462a-9e25-8d9296c3545b';
```

#### Return the deleted row

```sql
DELETE FROM "Character" WHERE "id" = 'a845e77f-2bce-462a-9e25-8d9296c3545b' RETURNING *;
```

### Transaction

#### Insert multiple rows in a transaction

```sql
BEGIN;
INSERT INTO "Character" ("name") VALUES ('Alice');
INSERT INTO "Character" ("name") VALUES ('Bob');
COMMIT;
```

## Permission Enforcement

TailorDB Permission settings are enforced at the SQL level, based on PostgreSQL's Row-Level Security (RLS) specifications. When accessing TailorDB via the Function service, it's important to understand how the settings affect SQL operations.

### Important Notes

- **Hooks, Validate, Serial, OnConflict, and ForeignKey operations ignore Permission** - This corresponds to PostgreSQL ignoring RLS for consistency checks
- **Be mindful of covert channels** - Users might infer other record values based on ForeignKey constraints even without Read Permission

### SQL Operation Details

#### INSERT

1. Execute Hooks/Serial
2. Retrieve existing records by ON CONFLICT fields
3. For INSERT case:
   - Check Create Permission
   - If RETURNING clause: Check Read Permission
   - Execute Validate/ForeignKey
4. For UPDATE case:
   - Check Read Permission on record before update
   - Continue with UPDATE flow

#### SELECT

1. Retrieve records while filtering by Read Permission

#### UPDATE

1. Retrieve records while filtering by Read Permission
2. Execute Hooks
3. Check Update Permission
4. If RETURNING clause: Check Read Permission on updated record
5. Execute Validate/ForeignKey

#### DELETE

1. Retrieve records while filtering by Read Permission
2. Check Delete Permission
3. Execute ForeignKey

For more information on configuring TailroDB Permission, see the [Permission documentation](/guides/tailordb/permission).

## Syntax

```
statement ::=
    select
    | insert
    | update
    | delete
    | begin
    | commit
    | rollback

select ::=
    SELECT select_item [, ...]
    FROM table_with_alias
    [ join [...] ]
    [ WHERE condition ]
    [ GROUP BY qualified_column_name [, ...] ]
    [ HAVING condition ]
    [ ORDER BY column_name_or_vector [ ASC | DESC ] [, ...] ]
    [ LIMIT int_value ]
    [ OFFSET int_value ]
    [ FOR { UPDATE | SHARE } [...] ]

table_with_alias ::=
    table_name [ [ AS ] alias ]

select_item ::=
    qualified_column_name [ AS alias ]
    | [ table_name . ] *
    | aggregate_function [ AS alias ]

aggregate_function ::=
    COUNT ( { [ DISTINCT ] qualified_column_name | * } )
    | { SUM | AVG | MIN | MAX } ( [ DISTINCT ] qualified_column_name )

join ::=
    [ INNER | { LEFT | RIGHT | FULL } [ OUTER ] ] JOIN table_with_alias ON condition
    | CROSS JOIN table_with_alias

column_name_or_vector ::=
    qualified_column_name
    | vector_similarity ( qualified_column_name , column_value )

insert ::=
    INSERT INTO table_name
    { ( column_name [, ...] ) VALUES ( { column_value | DEFAULT } [, ...] ) [, ...]
      | DEFAULT VALUES }
    [ ON CONFLICT ( column_name ) conflict_action ]
    [ RETURNING select_item [, ...] ]

conflict_action ::=
    DO NOTHING
    | DO UPDATE SET column_name = { column_value | EXCLUDED . column_name } [, ...]
      [ WHERE condition ]

update ::=
    UPDATE table_name
    SET column_name = column_name_or_value [ arithmetic_operator column_name_or_value ] [, ...]
    [ WHERE condition ]
    [ RETURNING select_item [, ...] ]

arithmetic_operator ::=
    + | - | * | /

delete ::=
    DELETE FROM table_name
    [ WHERE condition ]
    [ RETURNING select_item [, ...] ]

begin ::=
    { BEGIN [ WORK | TRANSACTION ] | START TRANSACTION }
    [ transaction_mode [, ...] ]

transaction_mode ::=
    ISOLATION LEVEL { SERIALIZABLE | REPEATABLE READ | READ COMMITTED | READ UNCOMMITTED }
    | READ WRITE | READ ONLY
    | [ NOT ] DEFERRABLE

commit ::=
    COMMIT [ WORK | TRANSACTION ]

rollback ::=
    ROLLBACK [ WORK | TRANSACTION ]

condition ::=
    left_operand binary_operator column_name_or_value
    | left_operand [ NOT ] IN ( column_name_or_value [, ...] )
    | left_operand [ NOT ] BETWEEN column_name_or_value AND column_name_or_value
    | left_operand IS [ NOT ] NULL
    | condition { AND | OR } condition
    | ( condition )

left_operand ::=
    qualified_column_name
    | aggregate_function

binary_operator ::=
    = | <> | < | <= | > | >=
    | ~~ | !~~ | ~~* | !~~*
    | ~ | !~ | ~* | !~*
    | [ NOT ] LIKE | [ NOT ] ILIKE

column_name_or_value ::=
    qualified_column_name
    | column_value

qualified_column_name ::=
    [ table_or_alias . ] column_name

table_or_alias ::=
    table_name | alias
```

## Working with Files

TailorDB File Type can be accessed programmatically from functions using the `tailordb.file` API. This allows you to upload, download, and manage files directly within your function code. For GraphQL-based file operations and HTTP endpoints, see the [File Type documentation](/guides/tailordb/file-type).

The file API is available through the global `tailordb` object in your function runtime and provides methods for complete file lifecycle management.

### Upload Files

You can upload files by providing either string content or binary data as a `Uint8Array`. The upload method returns metadata about the uploaded file.

```typescript {{ title: 'Upload a text file' }}
const uploadResponse = await tailordb.file.upload(
  namespace,
  typeName,
  fieldName,
  recordId,
  "File content as string",
  { contentType: "text/plain" },
);

console.log(`Uploaded: ${uploadResponse.metadata.fileSize} bytes`);
console.log(`SHA256: ${uploadResponse.metadata.sha256sum}`);
```

For binary files like images, use `Uint8Array`:

```typescript {{ title: 'Upload a binary file' }}
const pngData = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const imageUploadResponse = await tailordb.file.upload(
  namespace,
  typeName,
  fieldName,
  recordId,
  pngData,
  { contentType: "image/png" },
);
```

### Download Files

Download files to retrieve both the file content and metadata. The content is returned as a `Uint8Array`.

Files larger than 10 MB cannot be downloaded using download() or downloadAsBase64(). Attempting to download a file that exceeds this limit will throw a FILE_TOO_LARGE error. For larger files, use openDownloadStream(), as shown [here](#stream-large-files).

```typescript {{ title: 'Download a file' }}
const downloadResponse = await tailordb.file.download(namespace, typeName, fieldName, recordId);

console.log(`Downloaded: ${downloadResponse.metadata.fileSize} bytes`);
console.log(`Content type: ${downloadResponse.metadata.contentType}`);

const textContent = new TextDecoder().decode(downloadResponse.data);
```

The download response includes:

- `data`: The file content as `Uint8Array`
- `metadata`: File metadata object (see [API Reference](#api-reference))

### Download Files as Base64

For scenarios where you need the file content as a base64-encoded string (e.g., embedding in JSON responses or passing to external APIs), use `downloadAsBase64()`.

```typescript {{ title: 'Download a file as base64' }}
const base64Response = await tailordb.file.downloadAsBase64(
  namespace,
  typeName,
  fieldName,
  recordId,
);

console.log(`Downloaded: ${base64Response.metadata.fileSize} bytes`);
console.log(`Content type: ${base64Response.metadata.contentType}`);
console.log(`Base64 content: ${base64Response.data}`);
```

The response includes:

- `data`: The file content as a base64-encoded string
- `metadata`: File metadata object (see [API Reference](#api-reference))

### Get File Metadata

Retrieve file metadata without downloading the actual file content. This is useful for checking file properties without the overhead of downloading the entire file.

```typescript {{ title: 'Get file metadata' }}
const metadata = await tailordb.file.getMetadata(namespace, typeName, fieldName, recordId);

console.log(`URL Path: ${metadata.urlPath}`);
console.log(`Content Type: ${metadata.contentType}`);
console.log(`File Size: ${metadata.fileSize} bytes`);
console.log(`SHA256: ${metadata.sha256sum}`);
console.log(`Last Uploaded: ${metadata.lastUploadedAt}`);
```

### Stream Large Files

For large files, use streaming download to process files efficiently without loading the entire content into memory at once. The stream uses an async iterator pattern.

```typescript {{ title: 'Stream download a large file' }}
const stream = await tailordb.file.openDownloadStream(namespace, typeName, fieldName, recordId);

let totalBytes = 0;
let reconstructedData: Uint8Array | null = null;
let offset = 0;

try {
  for await (const chunkResult of stream) {
    switch (chunkResult.type) {
      case "metadata":
        console.log(`Stream started: ${chunkResult.metadata.fileSize} bytes`);
        if (chunkResult.metadata.fileSize > 0) {
          reconstructedData = new Uint8Array(chunkResult.metadata.fileSize);
        }
        break;

      case "chunk":
        const chunk = new Uint8Array(chunkResult.data);
        totalBytes += chunk.length;

        if (reconstructedData) {
          reconstructedData.set(chunk, offset);
          offset += chunk.length;
        }
        break;

      case "complete":
        console.log(`Stream completed. Total: ${totalBytes} bytes`);
        break;
    }
  }
} finally {
  await stream.close();
}
```

The streaming API yields three types of results:

- `metadata`: First result containing file metadata
- `chunk`: Each data chunk with `data` (ArrayBuffer) and `position` (number)
- `complete`: Final result indicating stream completion

### Delete Files

Delete a file attached to a record. This removes the file but does not delete the record itself.

```typescript {{ title: 'Delete a file' }}
await tailordb.file.delete(namespace, typeName, fieldName, recordId);

console.log("File deleted successfully");
```

### Error Handling

All file operations throw `TailorDBFileError` on failure. Use this for proper error handling and diagnostics.

```typescript {{ title: 'Handle file errors' }}
try {
  await tailordb.file.upload(namespace, typeName, fieldName, recordId, fileContent, {
    contentType: "text/plain",
  });
} catch (error) {
  if (error instanceof TailorDBFileError) {
    console.error(`File error code: ${error.code}`);
    console.error(`Message: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

### API Reference

#### File Metadata Properties

All file operations return or accept metadata with the following properties:

| Property         | Type     | Description                                             |
| ---------------- | -------- | ------------------------------------------------------- |
| `contentType`    | `string` | MIME type of the file (e.g., "image/png", "text/plain") |
| `fileSize`       | `number` | Size of the file in bytes                               |
| `sha256sum`      | `string` | SHA-256 checksum of the file content                    |
| `lastUploadedAt` | `string` | ISO 8601 timestamp of the last upload                   |
| `urlPath`        | `string` | Path portion of the URL                                 |

#### Method Signatures

```typescript
tailordb.file.upload(
  namespace: string,
  typeName: string,
  fieldName: string,
  recordId: string,
  content: string | Uint8Array,
  options: { contentType: string }
): Promise<{ metadata: FileMetadata }>

tailordb.file.download(
  namespace: string,
  typeName: string,
  fieldName: string,
  recordId: string
): Promise<{ data: Uint8Array; metadata: FileMetadata }>

tailordb.file.downloadAsBase64(
  namespace: string,
  typeName: string,
  fieldName: string,
  recordId: string
): Promise<{ data: string; metadata: FileMetadata }>

tailordb.file.getMetadata(
  namespace: string,
  typeName: string,
  fieldName: string,
  recordId: string
): Promise<FileMetadata>

tailordb.file.openDownloadStream(
  namespace: string,
  typeName: string,
  fieldName: string,
  recordId: string
): Promise<AsyncIterator<ChunkResult>>

tailordb.file.delete(
  namespace: string,
  typeName: string,
  fieldName: string,
  recordId: string
): Promise<void>
```

### See Also

- [File Type documentation](/guides/tailordb/file-type) - For GraphQL operations, HTTP endpoints, and schema definitions
- [TailorDB Schema](/guides/tailordb/overview) - For defining fields in your schema
