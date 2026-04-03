# Adding a New Field to Data Model

Tailor Platform makes it easy to modify data schemas. With TailorDB, you can modify existing data types and the GraphQL endpoint will be automatically generated.

This tutorial demonstrates how to add a new field to an existing data type using the SDK.

- See [Core Concepts](/getting-started/core-concepts/) to get an overview of Workspace, Organization, Application and Service.
- To follow along with this tutorial, first complete the [SDK Quickstart](../../sdk/quickstart) and the [Data Schema Basics](data-schema-basics) tutorial.

## TailorDB

TailorDB is a service that enables you to manage data schemas and automatically generate GraphQL APIs based on those schemas. See [TailorDB Service Documentation](../../sdk/services/tailordb) for more information.

## Tutorial Steps

To add a new `teamSize` field to the `Project` type, you will:

1. Add the `teamSize` field to the `Project` type
2. Deploy the change
3. Verify the schema change through GraphQL

### 1. Add the `teamSize` Field to the Project Type

Open your `db/project.ts` file and add the new field:

```typescript
import { db } from "@tailor-platform/sdk";

export const project = db.type("Project", {
  name: db.string().description("Project name"),
  description: db.string().optional().description("Project description"),
  status: db
    .enum(["planning", "active", "completed", "archived"])
    .description("Current project status"),
  startDate: db.string().optional().description("Project start date"),
  endDate: db.string().optional().description("Project end date"),
  budget: db.float().optional().description("Project budget"),
  priority: db.enum(["low", "medium", "high", "critical"]).description("Project priority level"),
  teamSize: db.int().optional().description("Number of team members"),
  ...db.fields.timestamps(),
});
export type project = typeof project;
```

The new `teamSize` field:

- Has type `int()` for integer values
- Is optional (can be null)
- Includes a description for documentation

Fields like `id` are automatically generated without being explicitly defined. These are pre-defined fields. See [Auto-generated Fields](../../sdk/services/tailordb#auto-generated-fields) for more information.

### 2. Deploy the Change

Deploy the updated schema to your workspace:

```bash
npm run deploy -- --workspace-id <your-workspace-id>
```

The SDK will:

- Detect the schema changes
- Update the TailorDB type
- Regenerate the GraphQL API with the new field

### 3. Verify Schema Change Through GraphQL

Open the GraphQL Playground in the [Console](https://console.tailor.tech) and select your workspace.

Create a Project with the new `teamSize` field:

```graphql
mutation {
  createProject(
    input: {
      name: "Website Redesign"
      description: "Complete redesign of company website"
      status: "active"
      priority: "high"
      teamSize: 5
      createdAt: "2026-02-09T10:00:00Z"
      updatedAt: "2026-02-09T10:00:00Z"
    }
  ) {
    id
    name
    teamSize
  }
}
```

Example response:

```json
{
  "data": {
    "createProject": {
      "id": "c3e9313b-ef80-45da-a5b2-f6d77810dd92",
      "name": "Website Redesign",
      "teamSize": 5
    }
  }
}
```

Query the project to verify the `teamSize` field:

```graphql
query {
  project(id: "c3e9313b-ef80-45da-a5b2-f6d77810dd92") {
    name
    teamSize
    status
    priority
  }
}
```

Example response:

```json
{
  "data": {
    "project": {
      "name": "Website Redesign",
      "teamSize": 5,
      "status": "active",
      "priority": "high"
    }
  }
}
```

## Next Steps

Now that you've learned how to add a field, you can proceed to:

- [Creating Data Schema](create-data-schema) - Learn how to create new types
- [Field Types](../../sdk/services/tailordb#field-types) - Explore all available field types
- [Field Validation](../../sdk/services/tailordb#validation) - Add validation rules to fields

## Further Information

- [TailorDB Service](../../sdk/services/tailordb) - Complete TailorDB documentation
- [Schema Design Best Practices](../../sdk/services/tailordb#best-practices) - Tips for designing effective schemas
