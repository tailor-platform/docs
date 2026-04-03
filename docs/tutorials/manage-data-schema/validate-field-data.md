# Validate Field Data

Accurate and valid data is essential to ensure the success of any application. Tailor Platform provides an easy way to validate data with TailorDB. You can define validation rules within your data model to ensure your data is accurate and valid.

This tutorial demonstrates how to apply data validation rules to your fields using the SDK.

- See [Core Concepts](/getting-started/core-concepts/) to get an overview of Workspace, Organization, Application and Service.
- To follow along with this tutorial, first complete the [SDK Quickstart](../../sdk/quickstart) and the [Data Schema Basics](data-schema-basics) tutorial.

## Tutorial Steps

Follow these steps to add a validation rule to the `name` field of a Project:

1. Define a validation rule
2. Deploy the change
3. Confirm the applied validation rule

### 1. Define a Validation Rule

Open your `db/project.ts` file and add a validation rule to the `name` field. We'll ensure project names are between 3 and 50 characters:

```typescript
import { db } from "@tailor-platform/sdk";

export const project = db.type("Project", {
  name: db
    .string()
    .description("Project name")
    .validate(
      ({ value }) => value.length >= 3,
      [({ value }) => value.length <= 50, "Project name must be 50 characters or less"],
    ),
  description: db.string().optional().description("Project description"),
  status: db
    .enum(["planning", "active", "completed", "archived"])
    .description("Current project status"),
  startDate: db.string().optional().description("Project start date"),
  endDate: db.string().optional().description("Project end date"),
  completionPercentage: db
    .int()
    .optional()
    .validate(
      ({ value }) => value === undefined || (value >= 0 && value <= 100),
      "Completion percentage must be between 0 and 100",
    )
    .description("Project completion percentage"),
  priority: db.enum(["low", "medium", "high", "critical"]).description("Project priority level"),
  teamSize: db
    .int()
    .optional()
    .validate(
      ({ value }) => value === undefined || (value > 0 && value <= 100),
      "Team size must be between 1 and 100",
    )
    .description("Number of team members"),
  ...db.fields.timestamps(),
});
export type project = typeof project;
```

**Validation Rules Explained:**

- **name**: Must be at least 3 characters and no more than 50 characters
- **completionPercentage**: Must be between 0 and 100 (if provided)
- **teamSize**: Must be between 1 and 100 (if provided)

The `validate()` method accepts:

- A validation function that receives `{ value }` and returns `true` if valid
- An optional error message (string or tuple with function and message)
- Multiple validations can be chained

For more information, see [Input Validation](../../sdk/services/resolver#input-validation) documentation.

### 2. Deploy the Change

Deploy the updated schema with validation rules:

```bash
npm run deploy -- --workspace-id <your-workspace-id>
```

The SDK will deploy the schema with the validation rules applied.

### 3. Confirm the Applied Validation Rule

Open the GraphQL Playground in the [Console](https://console.tailor.tech) and select your workspace.

**Test 1: Invalid Project Name (Too Short)**

Try to create a project with a name that's too short:

```graphql
mutation {
  createProject(
    input: {
      name: "AB"
      status: "active"
      priority: "high"
      createdAt: "2026-02-09T10:00:00Z"
      updatedAt: "2026-02-09T10:00:00Z"
    }
  ) {
    id
  }
}
```

Error response:

```json
{
  "errors": [
    {
      "message": "name: Validation failed",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["createProject"]
    }
  ],
  "data": {
    "createProject": null
  }
}
```

**Test 2: Invalid Project Name (Too Long)**

Try to create a project with a name that exceeds the maximum length:

```graphql
mutation {
  createProject(
    input: {
      name: "This is an extremely long project name that exceeds the fifty character limit"
      status: "active"
      priority: "high"
      createdAt: "2026-02-09T10:00:00Z"
      updatedAt: "2026-02-09T10:00:00Z"
    }
  ) {
    id
  }
}
```

Error response:

```json
{
  "errors": [
    {
      "message": "name: Project name must be 50 characters or less",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["createProject"]
    }
  ],
  "data": {
    "createProject": null
  }
}
```

**Test 3: Invalid Completion Percentage**

Try to create a project with an invalid completion percentage:

```graphql
mutation {
  createProject(
    input: {
      name: "Website Redesign"
      status: "active"
      priority: "high"
      completionPercentage: 150
      createdAt: "2026-02-09T10:00:00Z"
      updatedAt: "2026-02-09T10:00:00Z"
    }
  ) {
    id
  }
}
```

Error response:

```json
{
  "errors": [
    {
      "message": "completionPercentage: Completion percentage must be between 0 and 100",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["createProject"]
    }
  ],
  "data": {
    "createProject": null
  }
}
```

**Test 4: Invalid Team Size**

Try to create a project with an invalid team size:

```graphql
mutation {
  createProject(
    input: {
      name: "Website Redesign"
      status: "active"
      priority: "high"
      teamSize: 150
      createdAt: "2026-02-09T10:00:00Z"
      updatedAt: "2026-02-09T10:00:00Z"
    }
  ) {
    id
  }
}
```

Error response:

```json
{
  "errors": [
    {
      "message": "teamSize: Team size must be between 1 and 100",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["createProject"]
    }
  ],
  "data": {
    "createProject": null
  }
}
```

**Test 5: Valid Project**

Create a project with valid data:

```graphql
mutation {
  createProject(
    input: {
      name: "Website Redesign"
      description: "Complete redesign of company website"
      status: "active"
      priority: "high"
      completionPercentage: 25
      teamSize: 8
      createdAt: "2026-02-09T10:00:00Z"
      updatedAt: "2026-02-09T10:00:00Z"
    }
  ) {
    id
    name
    teamSize
    completionPercentage
  }
}
```

Successful response:

```json
{
  "data": {
    "createProject": {
      "id": "e10f0541-3521-469c-a269-951b6ba06cc3",
      "name": "Website Redesign",
      "teamSize": 8,
      "completionPercentage": 25
    }
  }
}
```

## Next Steps

Learn more about validation and schema design:

- [Field Validation](../../sdk/services/tailordb#validation) - Complete validation reference
- [Field Types](../../sdk/services/tailordb#field-types) - All available field types
- [Creating Data Schema](create-data-schema) - Learn how to create new types
- [Best Practices](../../sdk/services/tailordb#best-practices) - Schema design guidelines
