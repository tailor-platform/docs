---
doc_type: guide
---

# Built-in interfaces

Functions (Resolvers, Workflows, Executors) have access to built-in interfaces as global variables.
These provide direct access to platform services without external HTTP calls or token management.

All interfaces are typed via [`@tailor-platform/function-types`](https://github.com/tailor-platform/function/tree/main/packages/types) — install the package to get full TypeScript support.

Importing from `@tailor-platform/sdk` no longer activates these ambient `tailor.*` / `tailordb.*` globals automatically. Add `import "@tailor-platform/sdk/runtime/globals"` as a side-effect import in your function file (or use the typed wrappers from `@tailor-platform/sdk/runtime` instead) — see [Runtime](/sdk/runtime) for details.

## Overview

| Service                                   | Description                                                        |
| ----------------------------------------- | ------------------------------------------------------------------ |
| [IdP Client](#idp-client)                 | Create, update, delete IdP users and send password reset emails    |
| [Secret Manager](#secret-manager)         | Retrieve secrets from vaults                                       |
| [Auth Connection](#auth-connection)       | Get access tokens for external auth connections                    |
| [Character Encoding](#character-encoding) | Convert between character encodings (iconv)                        |
| [Workflow](#workflow)                     | Start workflows and execute job functions                          |
| [TailorDB Client](#tailordb-client)       | Execute SQL queries against TailorDB                               |
| [TailorDB File](#tailordb-file)           | Upload, download, and manage files in TailorDB                     |
| [Logger](#logger)                         | Emit structured logs with severity levels and queryable attributes |

## IdP Client

**Interface**: `tailor.idp.Client`

Manage Built-in IdP users directly from your function. No external HTTP calls or machine user tokens needed.

**See also**: [Managing IdP Users in Functions](/guides/function/managing-idp-users)

```typescript
const client = new tailor.idp.Client({ namespace: "my-namespace" });

// Create a user
const user = await client.createUser({ name: "user@example.com", password: "secret" });

// List users with filtering
const { users, totalCount } = await client.users({
  first: 10,
  query: { names: ["user@example.com"] },
});

// Get by ID or by name
const user = await client.user(userId);
const userByName = await client.userByName("foo@example.com");
await client.updateUser({ id: userId, name: "new@example.com" });
await client.deleteUser(userId);

// Send password reset email
await client.sendPasswordResetEmail({
  userId: user.id,
  redirectUri: "https://app.example.com/reset",
  fromName: "My App Support", // optional: overrides namespace default
  subject: "Reset your password", // optional: overrides namespace default
});
```

| Method                          | Returns                      | Description                                       |
| ------------------------------- | ---------------------------- | ------------------------------------------------- |
| `users(options?)`               | `Promise<ListUsersResponse>` | List users with optional filtering and pagination |
| `user(userId)`                  | `Promise<User>`              | Get a user by ID                                  |
| `userByName(name)`              | `Promise<User>`              | Get a user by name                                |
| `createUser(input)`             | `Promise<User>`              | Create a new user                                 |
| `updateUser(input)`             | `Promise<User>`              | Update an existing user                           |
| `deleteUser(userId)`            | `Promise<boolean>`           | Delete a user by ID                               |
| `sendPasswordResetEmail(input)` | `Promise<boolean>`           | Send a password reset email                       |

## Secret Manager

**Interface**: `tailor.secretmanager`

Retrieve secrets stored in Tailor Platform vaults.

```typescript
// Get a single secret
const apiKey = await tailor.secretmanager.getSecret("my-vault", "API_KEY");

// Get multiple secrets at once
const secrets = await tailor.secretmanager.getSecrets("my-vault", [
  "API_KEY",
  "API_SECRET",
] as const);
// secrets.API_KEY, secrets.API_SECRET
```

| Function                   | Returns                                    | Description                                           |
| -------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| `getSecret(vault, name)`   | `Promise<string \| undefined>`             | Get a single secret. Returns `undefined` if not found |
| `getSecrets(vault, names)` | `Promise<Partial<Record<string, string>>>` | Get multiple secrets. Missing keys are omitted        |

## Auth Connection

**Interface**: `tailor.authconnection`

Get access tokens for configured external auth connections (e.g., OAuth providers).

```typescript
const token = await tailor.authconnection.getConnectionToken("my-google-connection");
// Use token to call external APIs
```

| Function                             | Returns        | Description                                      |
| ------------------------------------ | -------------- | ------------------------------------------------ |
| `getConnectionToken(connectionName)` | `Promise<any>` | Get the access token for a named auth connection |

## Character Encoding

**Interface**: `tailor.iconv`

Convert between character encodings. Useful for processing files in non-UTF-8 encodings (e.g., Shift_JIS CSV files).

```typescript
// Convert Shift_JIS buffer to UTF-8 string
const text = tailor.iconv.decode(shiftJisBuffer, "Shift_JIS");

// Encode a string to Shift_JIS
const encoded = tailor.iconv.encode("こんにちは", "Shift_JIS");

// Convert between encodings
const result = tailor.iconv.convert(buffer, "EUC-JP", "UTF-8");

// List supported encodings
const encodings = tailor.iconv.encodings();
```

| Function                                 | Returns                | Description                                                      |
| ---------------------------------------- | ---------------------- | ---------------------------------------------------------------- |
| `convert(str, fromEncoding, toEncoding)` | `string \| Uint8Array` | Convert between encodings. Returns `string` when target is UTF-8 |
| `decode(buffer, encoding)`               | `string`               | Decode a buffer to a UTF-8 string                                |
| `encode(str, encoding)`                  | `string \| Uint8Array` | Encode a string to the specified encoding                        |
| `encodings()`                            | `string[]`             | List all supported encodings                                     |

The `Iconv` class is also available for node-iconv compatibility:

```typescript
const converter = new tailor.iconv.Iconv("Shift_JIS", "UTF-8");
const result = converter.convert(inputBuffer);
```

## Workflow

**Interface**: `tailor.workflow`

Start workflows and job functions from within a function.

```typescript
// Start a workflow
const executionId = await tailor.workflow.startWorkflow("processOrder", {
  orderId: "order-123",
});

// Start with a specific machine user
const executionId = await tailor.workflow.startWorkflow(
  "processOrder",
  { orderId: "order-123" },
  {
    authInvoker: {
      namespace: "my-namespace",
      machineUserName: "workflow-runner",
    },
  },
);

// Execute a job function
const result = await tailor.workflow.execJobFunction("calculateTax", {
  amount: 1000,
});

// Route the dispatch through a workspace-registered execution policy for
// per-key concurrency control (see the SDK Workflow guide for policy setup).
const scoped = await tailor.workflow.execJobFunction(
  "syncTenant",
  { tenantId: "acme" },
  { executionPolicyKey: `tenant-api.acme` },
);
```

| Function                                 | Returns           | Description                                                                                                                                                        |
| ----------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `startWorkflow(name, args?, options?)`   | `Promise<string>` | Start a workflow. Returns the execution ID                                                                                                                        |
| `execJobFunction(name, args?, options?)` | `Promise<any>`    | Execute a job function and return its result. `options.executionPolicyKey` routes the dispatch through a matching execution policy for per-key concurrency control |

For details on declaring execution policies and the key grammar, see [Execution Policies](/sdk/services/workflow#execution-policies) in the SDK Workflow reference.

## TailorDB Client

**Interface**: `tailordb.Client`

Execute SQL queries directly against TailorDB. For ORM-style access, consider using `@tailor-platform/function-kysely-tailordb`.

**See also**: [Accessing TailorDB](/guides/function/accessing-tailordb)

```typescript
const db = new tailordb.Client({ namespace: "my-namespace" });
await db.connect();

try {
  const result = await db.queryObject<{ id: string; name: string }>(
    "SELECT id, name FROM users WHERE active = $1",
    [true],
  );
  console.log(result.rows); // [{ id: "...", name: "..." }, ...]
} finally {
  await db.end();
}
```

| Method                       | Returns                   | Description                                      |
| ---------------------------- | ------------------------- | ------------------------------------------------ |
| `connect()`                  | `Promise<void>`           | Open the database connection                     |
| `end()`                      | `Promise<void>`           | Close the database connection                    |
| `queryObject<T>(sql, args?)` | `Promise<QueryResult<T>>` | Execute a SQL query with parameterized arguments |

## TailorDB File

**Interface**: `tailordb.file`

Upload, download, and manage files attached to TailorDB records.

```typescript
// Upload a file
const { metadata } = await tailordb.file.upload(
  "my-namespace",
  "Document",
  "attachment",
  recordId,
  fileData,
  { contentType: "application/pdf" },
);

// Download a file
const { data, metadata } = await tailordb.file.download(
  "my-namespace",
  "Document",
  "attachment",
  recordId,
);

// Download as Base64 (for embedding in JSON responses)
const { data: base64 } = await tailordb.file.downloadAsBase64(
  "my-namespace",
  "Document",
  "attachment",
  recordId,
);

// Stream download large files (>10MB)
await tailordb.file.downloadStream("my-namespace", "Document", "attachment", recordId);

// Stream upload a file
await tailordb.file.uploadStream(
  "my-namespace",
  "Document",
  "attachment",
  recordId,
  readableStream,
);

// Get metadata without downloading
const meta = await tailordb.file.getMetadata("my-namespace", "Document", "attachment", recordId);

// Delete a file
await tailordb.file.delete("my-namespace", "Document", "attachment", recordId);
```

**Note**: All methods take `(namespace, typeName, fieldName, recordId)` as the first four arguments.

| Method                                        | Returns                                 | Description                                      |
| --------------------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| `upload(..., data, options?)`                 | `Promise<FileUploadResponse>`           | Upload a file                                    |
| `download(...)`                               | `Promise<FileDownloadResponse>`         | Download a file as `Uint8Array`. Throws if >10MB |
| `downloadAsBase64(...)`                       | `Promise<FileDownloadAsBase64Response>` | Download as Base64 string. Throws if >10MB       |
| `delete(...)`                                 | `Promise<void>`                         | Delete a file                                    |
| `getMetadata(...)`                            | `Promise<FileMetadata>`                 | Get file metadata without downloading            |
| `downloadStream(...)`                         | `Promise<FileDownloadStreamResponse>`   | Download a file as a `ReadableStream`            |
| `uploadStream(..., readableStream, options?)` | `Promise<FileUploadResponse>`           | Upload a file using a `ReadableStream`           |

## Logger

**Interface**: `tailor.logger`

Emit structured logs with a severity level and optional attributes. The message is written to standard output, and the full entry with its attributes is exported as an OpenTelemetry log through [TelemetryRouter](/guides/opentelemetry) to your configured backend.

```typescript
tailor.logger.info("order processed", {
  orderId: "o-123",
  amount: 4980,
  items: ["sku-1", "sku-2"],
});

// Set attributes once, applied to every subsequent log in the same execution
tailor.logger.setAttributes({ tenantId: "t-001", requestId: "req-abc" });
tailor.logger.info("start"); // tenantId / requestId attached
```

| Method                        | Description                                                             |
| ----------------------------- | ----------------------------------------------------------------------- |
| `debug(message, attributes?)` | Emit a log at debug severity                                            |
| `info(message, attributes?)`  | Emit a log at info severity                                             |
| `warn(message, attributes?)`  | Emit a log at warning severity                                          |
| `error(message, attributes?)` | Emit a log at error severity                                            |
| `setAttributes(attributes)`   | Set attributes applied to every subsequent log in the current execution |

Attribute limits and other details are documented in the JSDoc.
