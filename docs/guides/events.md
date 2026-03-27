---
doc_type: guide
---

# Events and Payloads

The Tailor Platform offers a wide range of events that allow you to trigger specific actions within your applications. These events play a crucial role in building dynamic workflows and enable you to automate processes based on real-time data changes. Refer to the [Event based trigger](/guides/executor/event-based-trigger) section for details on using and configuring events.

Below is a list of supported events and their payloads.

## TailorDB

### Record Created

`tailordb.type_record.created`

| Field Name | Description |
|------------|-------------|
| `workspaceId` | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application. |
| `typeName` | `String`: Name of the type. |
| `newRecord` | `Object`: The new record added to Tailor DB. |

### Record Updated

`tailordb.type_record.updated`

| Field Name | Description |
|------------|-------------|
| `workspaceId` | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application. |
| `typeName` | `String`: Name of the type. |
| `oldRecord` | `Object`: The old record in Tailor DB. |
| `newRecord` | `Object`: The updated record in Tailor DB. |

### Record Deleted

`tailordb.type_record.deleted`

| Field Name | Description |
|------------|-------------|
| `workspaceId` | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application. |
| `typeName` | `String`: Name of the type. |
| `oldRecord` | `Object`: The deleted record. |

### File Uploaded

`tailordb.type_record_file.uploaded`

| Field Name | Description |
|------------|-------------|
| `workspaceId` | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application. |
| `typeName` | `String`: Name of the type. |
| `metadata.content_type` | `String`: MIME type of the uploaded file. |
| `metadata.field_name` | `String`: Name of the file field that received the upload. |
| `metadata.last_uploaded_at` | `DateTime`: Timestamp when the file was uploaded. |
| `metadata.parent_id` | `String`: ID of the record that owns the file. |
| `metadata.sha256sum` | `String`: SHA256 checksum of the uploaded file. |
| `metadata.size` | `Integer`: Size of the uploaded file in bytes. |

## Pipeline

### Resolver Executed

`pipeline.resolver.executed`

| Field Name | Description |
|------------|-------------|
| `workspaceId` | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application. |
| `resolverName` | `String`: Name of the pipeline resolver. |
| `succeeded.result` | `Object`: The result object contains `pipelines` and `resolver` data. |
| `failed.error` | `String`: The error message provides details about the cause of the error. |

## Auth

### Access Token Issued

`auth.access_token.issued`

| Field Name | Description |
|------------|-------------|
| `workspaceId` | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application. |

## Built-in IdP

### User Created

`idp.user.created`

| Field Name | Description |
|------------|-------------|
| `workspaceId` | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application. |
| `userId` | `String`: The ID of the created IdP user. |

### User Updated

`idp.user.updated`

| Field Name | Description |
|------------|-------------|
| `workspaceId` | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application. |
| `userId` | `String`: The ID of the updated IdP user. |

### User Deleted

`idp.user.deleted`

| Field Name | Description |
|------------|-------------|
| `workspaceId` | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application. |
| `userId` | `String`: The ID of the deleted IdP user. |
