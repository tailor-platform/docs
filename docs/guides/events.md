---
doc_type: guide
---

# Events and Payloads

The Tailor Platform offers a wide range of events that allow you to trigger specific actions within your applications. These events play a crucial role in building dynamic workflows and enable you to automate processes based on real-time data changes. Refer to the [Event based trigger](/guides/executor/event-based-trigger) section for details on using and configuring events.

Below is a list of supported events and their payloads.

## TailorDB

### Record Created

`tailordb.type_record.created`

| Field Name      | Description                                          |
| --------------- | ---------------------------------------------------- |
| `workspaceId`   | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application.                   |
| `typeName`      | `String`: Name of the type.                          |
| `newRecord`     | `Object`: The new record added to Tailor DB.         |

### Record Updated

`tailordb.type_record.updated`

| Field Name      | Description                                          |
| --------------- | ---------------------------------------------------- |
| `workspaceId`   | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application.                   |
| `typeName`      | `String`: Name of the type.                          |
| `oldRecord`     | `Object`: The old record in Tailor DB.               |
| `newRecord`     | `Object`: The updated record in Tailor DB.           |

### Record Deleted

`tailordb.type_record.deleted`

| Field Name      | Description                                          |
| --------------- | ---------------------------------------------------- |
| `workspaceId`   | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application.                   |
| `typeName`      | `String`: Name of the type.                          |
| `oldRecord`     | `Object`: The deleted record.                        |

### File Uploaded

`tailordb.type_record_file.uploaded`

| Field Name                  | Description                                                |
| --------------------------- | ---------------------------------------------------------- |
| `workspaceId`               | `String`: The workspace ID where the event occurred.       |
| `namespaceName`             | `String`: Name of the application.                         |
| `typeName`                  | `String`: Name of the type.                                |
| `metadata.content_type`     | `String`: MIME type of the uploaded file.                  |
| `metadata.field_name`       | `String`: Name of the file field that received the upload. |
| `metadata.last_uploaded_at` | `DateTime`: Timestamp when the file was uploaded.          |
| `metadata.parent_id`        | `String`: ID of the record that owns the file.             |
| `metadata.sha256sum`        | `String`: SHA256 checksum of the uploaded file.            |
| `metadata.size`             | `Integer`: Size of the uploaded file in bytes.             |

## Pipeline

### Resolver Executed

`pipeline.resolver.executed`

| Field Name         | Description                                                                |
| ------------------ | -------------------------------------------------------------------------- |
| `workspaceId`      | `String`: The workspace ID where the event occurred.                       |
| `namespaceName`    | `String`: Name of the application.                                         |
| `resolverName`     | `String`: Name of the pipeline resolver.                                   |
| `succeeded.result` | `Object`: The result object contains `pipelines` and `resolver` data.      |
| `failed.error`     | `String`: The error message provides details about the cause of the error. |

## Auth

### Access Token Issued

`auth.access_token.issued`

| Field Name      | Description                                          |
| --------------- | ---------------------------------------------------- |
| `workspaceId`   | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application.                   |

## Built-in IdP

### User Created

`idp.user.created`

| Field Name      | Description                                          |
| --------------- | ---------------------------------------------------- |
| `workspaceId`   | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application.                   |
| `userId`        | `String`: The ID of the created IdP user.            |

### User Updated

`idp.user.updated`

| Field Name      | Description                                          |
| --------------- | ---------------------------------------------------- |
| `workspaceId`   | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application.                   |
| `userId`        | `String`: The ID of the updated IdP user.            |

### User Deleted

`idp.user.deleted`

| Field Name      | Description                                          |
| --------------- | ---------------------------------------------------- |
| `workspaceId`   | `String`: The workspace ID where the event occurred. |
| `namespaceName` | `String`: Name of the application.                   |
| `userId`        | `String`: The ID of the deleted IdP user.            |

## Workflow

Workflow publishes events on every meaningful state transition of a workflow execution, at two granularity levels. Workflow-level events describe the execution as a whole, and job-level events describe a single job execution within it.

Workflows are not scoped to an application namespace, so these events carry no `namespaceName` field.

Publishing is controlled per resource by `publishEvents`. When an executor subscribes to a workflow's events, the SDK enables publishing automatically on the resources that produce them. See [Execution Events](/guides/workflow/monitoring-executions#execution-events) for details.

All workflow-level events share the following fields.

| Field Name            | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `workspaceId`         | `String`: The workspace ID where the event occurred. |
| `workflowId`          | `String`: ID of the workflow resource.               |
| `workflowName`        | `String`: Name of the workflow.                      |
| `workflowExecutionId` | `String`: ID of the workflow execution.              |

Job-level events share the fields above plus the following.

| Field Name               | Description                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `workflowJobExecutionId` | `String`: ID of the job execution.                           |
| `jobFunctionName`        | `String`: Name of the job, as passed to `createWorkflowJob`. |

### Workflow Execution Started

`workflow.workflow_execution.started`

Published when the execution starts running, including when it starts running again after a retry or a resume.

### Workflow Execution Completed

`workflow.workflow_execution.completed`

Published when the execution reaches a terminal state.

| Field Name | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| `success`  | `Boolean`: Whether the execution succeeded.                     |
| `error`    | `String`: The error message. Present when `success` is `false`. |

### Workflow Execution Retried

`workflow.workflow_execution.retried`

Published when the execution is retried automatically by its retry policy.

| Field Name   | Description                                                        |
| ------------ | ------------------------------------------------------------------ |
| `retryCount` | `Integer`: Number of retries already attempted for this execution. |
| `retryAfter` | `DateTime`: Timestamp the retry is scheduled for.                  |

### Workflow Execution Resumed

`workflow.workflow_execution.resumed`

Published when a failed or retry-pending execution is resumed manually.

### Workflow Execution Wait Started

`workflow.workflow_execution.wait_started`

Published when a job suspends the execution on a wait point. Refer to [Wait / Resolve](/guides/workflow/wait-resolve) for details on wait points.

### Workflow Execution Wait Resolved

`workflow.workflow_execution.wait_resolved`

Published when a waiting execution is released by resolving its wait point.

### Job Execution Started

`workflow.workflow_execution.job_execution.started`

Published when the job is submitted and its execution starts running.

### Job Execution Completed

`workflow.workflow_execution.job_execution.completed`

Published when the job execution reaches a terminal state. A job execution released from a wait point publishes Job Execution Wait Resolved instead.

| Field Name | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| `success`  | `Boolean`: Whether the job execution succeeded.                 |
| `error`    | `String`: The error message. Present when `success` is `false`. |

### Job Execution Wait Started

`workflow.workflow_execution.job_execution.wait_started`

Published when the job calls `tailor.workflow.wait()` and its execution is created in the waiting state.

| Field Name    | Description                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| `waitKey`     | `String`: The wait point key the job execution is suspended on.                                           |
| `waitPayload` | `String`: JSON-serialized payload recorded with the wait point. Absent when the wait point recorded none. |

### Job Execution Wait Resolved

`workflow.workflow_execution.job_execution.wait_resolved`

Published when a waiting job execution is released by resolving its wait point.

| Field Name | Description                                     |
| ---------- | ----------------------------------------------- |
| `waitKey`  | `String`: The wait point key that was resolved. |
