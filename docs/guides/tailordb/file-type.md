---
doc_type: guide
---

# File Type

TailorDB File Type enables developers to attach files to records in their data model, providing seamless file management capabilities integrated with GraphQL queries and HTTP operations. This feature eliminates the need for separate file storage solutions by providing:

- Integrated file storage with TailorDB records
- Attachment file management (size, checksum, content type, timestamps)
- Permission-based access control aligned with record-level permissions
- GraphQL query integration for file metadata filtering

## Basic Workflow

1. Define file attachments in your schema
2. Create records with file attachment fields
3. Upload files via HTTP PUT to auto-generated URLs
4. Query file info through GraphQL
5. Download files via HTTP GET
6. Delete files via HTTP DELETE

## Schema Definition

Files are defined in the **Files** section (not Fields) of your table definition. Each file type field in a record has a reserved URL endpoint that serves as both the upload and download location for that specific field. This URL is automatically generated when the record is created and remains constant throughout the record's lifecycle.

```typescript {{ title: "Schema Definition" }}
db.table("Starship", {
  name: db.string().description("Name of the starship"),
  blueprint: db.file().description("Technical blueprint file"),
  thumbnail: db.file().description("Thumbnail image"),
});
```

## GraphQL Operations

### Querying File Metadata

When you query a record with file attachments, each file field returns metadata about the attached file:

```graphql {{ title: "Get Record with File Metadata" }}
query show {
  starship(id: "72f157d3-9f3f-40f8-9517-7627909d3580") {
    name
    blueprint {
      url
      urlPath
      size
      contentType
      lastUploadedAt
      sha256sum
    }
    thumbnail {
      url
      urlPath
      size
      contentType
      lastUploadedAt
      sha256sum
    }
  }
}
```

```json {{ title: "Response" }}
{
  "data": {
    "starship": {
      "name": "Millennium Falcon",
      "blueprint": {
        "url": "https://{YOUR_APP_SUBDOMAIN}.erp.dev/files/tailordb/galaxy/Starship/blueprint/72f157d3-9f3f-40f8-9517-7627909d3580",
        "urlPath": "/files/tailordb/galaxy/Starship/blueprint/72f157d3-9f3f-40f8-9517-7627909d3580",
        "size": 6542,
        "contentType": "image/png",
        "lastUploadedAt": "2025-08-26T10:09:13.452171+09:00",
        "sha256sum": "a6034bb72c22843b3b06e59a8a9bf85b58fec62d71e69fe9c2ab61924fc25a98"
      },
      "thumbnail": {
        "url": "https://{YOUR_APP_SUBDOMAIN}.erp.dev/files/tailordb/galaxy/Starship/thumbnail/72f157d3-9f3f-40f8-9517-7627909d3580",
        "urlPath": "/files/tailordb/galaxy/Starship/thumbnail/72f157d3-9f3f-40f8-9517-7627909d3580",
        "size": null,
        "contentType": null,
        "lastUploadedAt": null,
        "sha256sum": null
      }
    }
  }
}
```

### File Metadata Properties

| Property       | Type     | Description                             |
| -------------- | -------- | --------------------------------------- |
| url            | String!  | Upload/download endpoint URL            |
| urlPath        | String!  | Path portion of the URL                 |
| size           | Int      | File size in bytes (null before upload) |
| sha256sum      | String   | SHA256 checksum of file content         |
| lastUploadedAt | DateTime | Timestamp of last upload                |
| contentType    | String   | MIME type of the file                   |

### Filtering by File Existence

You can filter records based on whether files exist:

```graphql {{ title: "Query with File Filters" }}
query getStarshipsWithFiles {
  starships(query: { blueprint: { exists: true } }) {
    edges {
      node {
        id
        name
        blueprint {
          url
          size
          contentType
          sha256sum
          lastUploadedAt
        }
      }
    }
  }
}
```

## HTTP File Operations

### Upload File

Use HTTP PUT to upload a file to the auto-generated URL endpoint:

```bash {{ title: "Upload File" }}
curl -X PUT \
  "https://{YOUR_APP_SUBDOMAIN}.erp.dev/files/tailordb/galaxy/Starship/cd7b898e-3779-4e3f-b484-607e92df1ebc/blueprint" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/pdf" \
  --data-binary @blueprint.pdf
```

### Download File

Use HTTP GET to download a file from the endpoint:

```bash {{ title: "Download File" }}
curl -X GET \
  "https://{YOUR_APP_SUBDOMAIN}.erp.dev/files/tailordb/galaxy/Starship/cd7b898e-3779-4e3f-b484-607e92df1ebc/blueprint" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded_blueprint.pdf
```

### Delete File

Use HTTP DELETE to remove a file:

```bash {{ title: "Delete File" }}
curl -X DELETE \
  "https://{YOUR_APP_SUBDOMAIN}.erp.dev/files/tailordb/galaxy/Starship/cd7b898e-3779-4e3f-b484-607e92df1ebc/blueprint" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Limitations and Notes

- You can specify up to **10 file types** in the Files section of your schema
- The maximum file size allowed for upload is **100 MB**
- If you upload a file to the same endpoint, the existing file will be overwritten
- File access permissions are aligned with record-level permissions
- Each file attachment has a unique, persistent URL that remains constant throughout the record's lifecycle
- **When a record is deleted, all attached files are automatically deleted as well**

## Related Documentation

- [Fields](/guides/tailordb/fields) - Learn about other field types in TailorDB
- [Auto-generated API](/guides/tailordb/auto-generated-api) - Understand the GraphQL API structure
- [Permission](/guides/tailordb/permission) - Configure access control for your data
