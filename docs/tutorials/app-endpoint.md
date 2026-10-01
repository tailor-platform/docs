---
description: "Add TailorDB, Resolver, Auth, Executor and Workflow services to an SDK app so each becomes an application endpoint, and verify the result in the GraphQL Playground."
---

# Adding Application Endpoints

This tutorial shows how to add new services to your Tailor application using the SDK. Services provide different capabilities like database access, custom logic, authentication, and workflow orchestration.

- To follow along with this tutorial, first complete the [SDK Quickstart](../sdk/quickstart). It provides the app template that we'll modify in the steps ahead.

## How Services Work in the SDK

The SDK automatically creates application endpoints (subgraphs) based on the services you configure in `tailor.config.ts`. When you define a service configuration, the SDK:

1. Reads your service files from the specified directories
2. Validates the service definitions
3. Generates the corresponding application endpoints
4. Deploys them to your workspace

## Available Services

You can configure the following services in your application:

- **TailorDB** (`db`): Database schema and types
- **Resolver** (`resolver`): Custom GraphQL query and mutation resolvers
- **Executor** (`executor`): Event-driven handlers that respond to database changes
- **Workflow** (`workflow`): Job orchestration for background tasks
- **Auth** (`auth`): Authentication and authorization
- **IdP** (`idp`): Built-in identity provider
- **Static Website** (`staticWebsites`): Static file hosting

## Adding a Service

To add a new service to your application, update your `tailor.config.ts` file with the service configuration. Each service requires you to specify glob patterns that match the files containing your service definitions.

### Example: Adding TailorDB

```typescript
import { defineConfig } from "@tailor-platform/sdk";

export default defineConfig({
  name: "my-app",
  db: {
    "my-database": {
      files: ["db/**/*.ts"],
    },
  },
});
```

This configuration tells the SDK to:

- Create a TailorDB service named "my-database"
- Load all TypeScript files from the `db/` directory

### Example: Adding Resolvers

```typescript
export default defineConfig({
  name: "my-app",
  resolver: {
    "my-resolver": {
      files: ["resolver/**/*.ts"],
    },
  },
});
```

### Example: Adding Multiple Services

You can configure multiple services in the same configuration file:

```typescript
export default defineConfig({
  name: "my-app",
  db: {
    "my-database": {
      files: ["db/**/*.ts"],
    },
  },
  resolver: {
    "my-resolver": {
      files: ["resolver/**/*.ts"],
    },
  },
  executor: {
    files: ["executors/**/*.ts"],
  },
  workflow: {
    files: ["workflows/**/*.ts"],
  },
});
```

## Deploying Changes

After updating your configuration, deploy the changes to your workspace:

```bash
npm run deploy -- --workspace-id <your-workspace-id>
```

The SDK will:

1. Load all service files matching your glob patterns
2. Generate the application endpoints for each configured service
3. Deploy them to your workspace

Your new service endpoints will be available in the GraphQL API after deployment completes.

## Next Steps

Learn more about configuring specific services:

- [TailorDB](../sdk/services/tailordb) - Database schema definition
- [Resolver](../sdk/services/resolver) - Custom GraphQL resolvers
- [Executor](../sdk/services/executor) - Event-driven handlers
- [Workflow](../sdk/services/workflow) - Job orchestration
- [Configuration](../sdk/configuration) - Complete configuration reference
