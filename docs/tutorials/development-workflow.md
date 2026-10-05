---
description: "Typical SDK project layout and day-to-day loop: define services, generate types, deploy with tailor deploy, and test in the GraphQL Playground."
---

# Development Workflow

This guide covers the typical development workflow when building applications with the Tailor Platform SDK.

## Local Development

### Project Structure

A typical SDK project has the following structure:

```
my-app/
├── src/
│   ├── db/              # TailorDB schema definitions
│   ├── resolver/        # Custom GraphQL resolvers
│   ├── executor/        # Event-driven handlers
│   └── generated/       # Generated code (e.g. Kysely types)
├── tailor.config.ts     # SDK configuration
├── tailor.d.ts          # Generated ambient types
└── package.json
```

The exact folder names come from the `files` globs in `tailor.config.ts`, so they are
yours to choose — the layout above is what the SDK templates use.

### Development Commands

```bash
# Generate TypeScript types (writes tailor.d.ts and src/generated/)
npm run generate

# Run tests (templates that ship tests wire this up to Vitest)
npm run test

# Type-check the project
npm run typecheck
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
TAILOR_PLATFORM_WORKSPACE_ID=your-workspace-id npm run deploy
```

## Testing

The SDK supports testing your application logic. A resolver's `body` receives the full
resolver context, so a unit test passes `caller`, `invoker` and `env` alongside `input`:

```typescript
import { test, expect } from "vitest";
import hello from "./resolvers/hello";

test("hello resolver returns greeting", async () => {
  const result = await hello.body({
    input: { name: "World" },
    caller: null,
    invoker: null,
    env: {},
  });
  expect(result.message).toBe("Hello, World!");
});
```

Templates that ship tests also register the `tailor-runtime` Vitest environment in
`vitest.config.ts` via the `tailorRuntime()` plugin from `@tailor-platform/sdk/vitest`,
which emulates the platform runtime globals during the test run.
