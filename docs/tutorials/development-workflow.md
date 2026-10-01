---
description: "Typical SDK project layout and day-to-day loop: define services, generate types, deploy with tailor apply, and test in the GraphQL Playground."
---

# Development Workflow

This guide covers the typical development workflow when building applications with the Tailor Platform SDK.

## Local Development

### Project Structure

A typical SDK project has the following structure:

```
my-app/
├── src/
│   ├── tailordb/        # Database schema definitions
│   ├── resolvers/       # Custom GraphQL resolvers
│   ├── executors/       # Event-driven handlers
│   └── index.ts         # Main entry point
├── tailor.config.ts     # SDK configuration
└── package.json
```

### Development Commands

```bash
# Start development with hot reload
npm run dev

# Generate TypeScript types
npm run generate

# Run tests
npm run test
```

## Deployment

### Deploy to a Workspace

```bash
# Deploy to your workspace
npm run deploy -- --workspace-id <your-workspace-id>
```

### Environment Management

Use environment variables for configuration:

```bash
# Set environment-specific values
TAILOR_WORKSPACE_ID=your-workspace-id npm run deploy
```

## Testing

The SDK supports testing your application logic:

```typescript
import { test, expect } from "vitest";
import hello from "./resolvers/hello";

test("hello resolver returns greeting", async () => {
  const result = await hello.body({
    input: { name: "World" },
  });
  expect(result.message).toBe("Hello, World!");
});
```
