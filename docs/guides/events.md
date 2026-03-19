---
doc_type: guide
---

# Events and Payloads

The Tailor Platform offers a wide range of events that allow you to trigger specific actions within your applications. These events play a crucial role in building dynamic workflows and enable you to automate processes based on real-time data changes. Refer to the [Event based trigger](/guides/executor/event-based-trigger) section for details on using and configuring events.

Below is a list of supported events and their payloads.

## TailorDB

### Record Created

`tailordb.type_record.created`

<table>
<thead>
  <tr>
    <th>Field Name </th>
    <th>Description</th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>`workspaceId`</td>
    <td>`String`: The workspace ID where the event occurred.</td>
  </tr>

  <tr>
    <td>`namespaceName`</td>
    <td>`String`: Name of the application.</td>
  </tr>

  <tr>
    <td>`typeName`</td>
    <td>`String`: Name of the type.</td>
  </tr>

  <tr>
    <td>`newRecord`</td>
    <td>`Object`: The new record added to TailorDB.</td>
  </tr>
</tbody>
</table>

### Record Updated

`tailordb.type_record.updated`

<table>
<thead>
  <tr>
    <th>Field Name </th>
    <th>Description</th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>`workspaceId`</td>
    <td>`String`: The workspace ID where the event occurred.</td>
  </tr>

  <tr>
    <td>`namespaceName`</td>
    <td>`String`: Name of the application.</td>
  </tr>

  <tr>
    <td>`typeName`</td>
    <td>`String`: Name of the type.</td>
  </tr>

  <tr>
    <td>`oldRecord`</td>
    <td>`Object`: The old record in TailorDB.</td>
  </tr>

  <tr>
    <td>`newRecord`</td>
    <td>`Object`: The updated record in TailorDB.</td>
  </tr>
</tbody>
</table>

### Record Deleted

`tailordb.type_record.deleted`

<table>
<thead>
  <tr>
    <th>Field Name </th>
    <th>Description</th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>`workspaceId`</td>
    <td>`String`: The workspace ID where the event occurred.</td>
  </tr>

  <tr>
    <td>`namespaceName`</td>
    <td>`String`: Name of the application.</td>
  </tr>

  <tr>
    <td>`typeName`</td>
    <td>`String`: Name of the type.</td>
  </tr>

  <tr>
    <td>`oldRecord`</td>
    <td>`Object`: The deleted record.</td>
  </tr>
</tbody>
</table>

### File Uploaded

`tailordb.type_record_file.uploaded`

<table>
<thead>
  <tr>
    <th>Field Name </th>
    <th>Description</th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>`workspaceId`</td>
    <td>`String`: The workspace ID where the event occurred.</td>
  </tr>

  <tr>
    <td>`namespaceName`</td>
    <td>`String`: Name of the application.</td>
  </tr>

  <tr>
    <td>`typeName`</td>
    <td>`String`: Name of the type.</td>
  </tr>

  <tr>
    <td>`metadata.content_type`</td>
    <td>`String`: MIME type of the uploaded file.</td>
  </tr>

  <tr>
    <td>`metadata.field_name`</td>
    <td>`String`: Name of the file field that received the upload.</td>
  </tr>

  <tr>
    <td>`metadata.last_uploaded_at`</td>
    <td>`DateTime`: Timestamp when the file was uploaded.</td>
  </tr>

  <tr>
    <td>`metadata.parent_id`</td>
    <td>`String`: ID of the record that owns the file.</td>
  </tr>

  <tr>
    <td>`metadata.sha256sum`</td>
    <td>`String`: SHA256 checksum of the uploaded file.</td>
  </tr>

  <tr>
    <td>`metadata.size`</td>
    <td>`Integer`: Size of the uploaded file in bytes.</td>
  </tr>
</tbody>
</table>

## Pipeline

### Resolver Executed

`pipeline.resolver.executed`

<table>
<thead>
  <tr>
    <th>Field Name </th>
    <th>Description</th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>`workspaceId`</td>
    <td>`String`: The workspace ID where the event occurred.</td>
  </tr>

  <tr>
    <td>`namespaceName`</td>
    <td>`String`: Name of the application.</td>
  </tr>

  <tr>
    <td>`resolverName`</td>
    <td>`String`: Name of the pipeline resolver. </td>
  </tr>

  <tr>
    <td>`succeeded.result`</td>
    <td>`Object`: The result object contains `pipelines` and `resolver` data.</td>
  </tr>

  <tr>
    <td>`failed.error`</td>
    <td>`String`: The error message provides details about the cause of the error.</td>
  </tr>
</tbody>
</table>

## Built-in IdP

### User Created

`idp.user.created`

<table>
<thead>
  <tr>
    <th>Field Name </th>
    <th>Description</th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>`workspaceId`</td>
    <td>`String`: The workspace ID where the event occurred.</td>
  </tr>

  <tr>
    <td>`namespaceName`</td>
    <td>`String`: Name of the application.</td>
  </tr>

  <tr>
    <td>`userId`</td>
    <td>`String`: The ID of the created IdP user.</td>
  </tr>
</tbody>
</table>

### User Updated

`idp.user.updated`

<table>
<thead>
  <tr>
    <th>Field Name </th>
    <th>Description</th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>`workspaceId`</td>
    <td>`String`: The workspace ID where the event occurred.</td>
  </tr>

  <tr>
    <td>`namespaceName`</td>
    <td>`String`: Name of the application.</td>
  </tr>

  <tr>
    <td>`userId`</td>
    <td>`String`: The ID of the updated IdP user.</td>
  </tr>
</tbody>
</table>

### User Deleted

`idp.user.deleted`

<table>
<thead>
  <tr>
    <th>Field Name </th>
    <th>Description</th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>`workspaceId`</td>
    <td>`String`: The workspace ID where the event occurred.</td>
  </tr>

  <tr>
    <td>`namespaceName`</td>
    <td>`String`: Name of the application.</td>
  </tr>

  <tr>
    <td>`userId`</td>
    <td>`String`: The ID of the deleted IdP user.</td>
  </tr>
</tbody>
</table>
