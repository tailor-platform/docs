# Workspace & Application

This guide explains how Workspaces and Applications work in Tailor Platform.

## Workspace

A Workspace is the top-level container for your Tailor Platform resources.

### Creating a Workspace

Using the SDK CLI:

```bash
# Create a new workspace
npx tailor workspace create --name my-workspace --region us-west

# List your workspaces
npx tailor workspace list
```

Or create one through the [Console](https://console.tailor.tech).

### Workspace Regions

Workspaces are deployed to specific regions:

| Region           | Location             |
| ---------------- | -------------------- |
| `us-west`        | United States (West) |
| `asia-northeast` | Asia Pacific (Tokyo) |

## Application

An Application represents a complete API deployment within a workspace.

### Application Configuration

Configure your application in `tailor.config.ts`:

```typescript
import { defineConfig } from "@tailor-platform/sdk";

export default defineConfig({
  name: "my-app",
  db: {
    "my-db": { files: ["db/**/*.ts"] },
  },
  resolver: {
    "my-resolver": { files: ["resolver/**/*.ts"] },
  },
  auth: { name: "my-auth" },
});
```

### Subgraphs

Each service you configure becomes a subgraph of your application's single GraphQL endpoint:

- `db` - TailorDB database service
- `resolver` - Custom resolvers and business logic
- `auth` - Authentication and authorization

See [Configuration](/sdk/configuration) for the full list of services.

### Deploying Applications

Deploy your application using the SDK CLI:

```bash
npm run deploy -- --workspace-id <your-workspace-id>
```

## Next Steps

- [Services](/getting-started/core-concepts/services) - Learn about available platform services
- [TailorDB](/guides/tailordb/overview) - Set up your database
- [Auth](/guides/auth/overview) - Configure authentication
