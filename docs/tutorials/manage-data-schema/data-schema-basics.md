# Data Schema in Tailor Platform

This tutorial demonstrates how a data schema is mapped to GraphQL APIs using the SDK.

- Complete the [SDK Quickstart](../../sdk/quickstart)

## Data Schema

A data model of your application is defined by the schema. Each table is typically defined in its own file for readability. See [TailorDB Documentation](../../sdk/services/tailordb) to learn more about schema definition.

## Tutorial Steps

1. Define a data table
2. View the schema in GraphQL playground
3. See how the configuration maps to GraphQL APIs

### 1. Define a Data Table

Create a `Project` table in your application. In your project's `db/` directory, create a file called `project.ts`:

```typescript
import { db } from "@tailor-platform/sdk";

export const project = db.table("Project", {
  name: db.string().description("Project name"),
  description: db.string().optional().description("Project description"),
  status: db
    .enum(["planning", "active", "completed", "archived"])
    .description("Current project status"),
  startDate: db.string().optional().description("Project start date"),
  endDate: db.string().optional().description("Project end date"),
  budget: db.float().optional().description("Project budget"),
  priority: db.enum(["low", "medium", "high", "critical"]).description("Project priority level"),
  ...db.fields.timestamps(),
});
export type project = typeof project;
```

This TypeScript file defines a `Project` table with various fields:

- **name**: Required string field for the project name
- **description**: Optional string field for project details
- **status**: Enumeration field with predefined values
- **startDate/endDate**: Optional date fields
- **budget**: Optional float field for financial tracking
- **priority**: Enumeration for priority levels
- **createdAt/updatedAt**: Timestamp fields for tracking changes

Deploy this schema using:

```bash
npm run deploy -- --workspace-id <your-workspace-id>
```

### 2. View the Schema in GraphQL Playground

Open the GraphQL playground by navigating to the [Console](https://console.tailor.tech) and selecting your workspace. Click on "GraphQL Playground" to access the interactive API explorer.

### 3. See How the Configuration Maps to GraphQL APIs

Now that you've seen the schema definition in the TypeScript file, let's explore how this maps to the GraphQL API. In the GraphQL playground, you can test the API with a query like the one below:

```graphql
query {
  projects {
    edges {
      node {
        id
        name
        description
        status
        priority
        startDate
        endDate
        budget
        createdAt
        updatedAt
      }
    }
  }
}
```

This query will return a list of `Project` objects with the specified fields. You can see how the schema defined in the TypeScript file is automatically converted to GraphQL types and operations.

You'll notice some fields like `id` are generated automatically without being explicitly defined in the schema. These are pre-defined fields. Please refer to [Auto-generated fields](../../sdk/services/tailordb#auto-generated-fields) for more information.

The SDK automatically creates:

- **Query operations**: `project`, `projects` for fetching data
- **Mutation operations**: `createProject`, `updateProject`, `deleteProject` for modifying data
- **Connection types**: For pagination support with `edges` and `node` structure

## Next Steps

Learn more about working with data schemas:

- [TailorDB Service](../../sdk/services/tailordb) - Complete TailorDB reference
- [Field Types](../../sdk/services/tailordb#field-types) - Available field types and options
- [Relationships](../../sdk/services/tailordb#relationships) - Define relations between tables
- [Modifying Data Schema](modify-data-schema) - How to update existing schemas
- [Creating Data Schema](create-data-schema) - Add new tables to your application
