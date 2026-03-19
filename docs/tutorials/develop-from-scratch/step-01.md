# Step 1: Create Database Schema

This step establishes the foundational database schema for your project management application using the Tailor Platform SDK. You'll define three core types (User, Project, Task) with relationships and automatic timestamp management, all using type-safe TypeScript.

[Source code on GitHub](https://github.com/tailor-platform/templates/tree/main/docs/build-from-scratch/sdk/step-01)

## Project Setup

```json {{title: 'package.json'}}
{
  "name": "project-management",
  "private": true,
  "type": "module",
  "scripts": {
    "deploy": "tailor-sdk apply",
    "generate": "tailor-sdk generate"
  },
  "dependencies": {
    "@tailor-platform/function-kysely-tailordb": "0.1.3",
    "kysely": "0.28.10"
  },
  "devDependencies": {
    "@tailor-platform/sdk": "latest",
    "typescript": "5.9.3"
  }
}
```

```json {{title: 'tsconfig.json'}}
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node", "@tailor-platform/function-types"]
  },
  "include": ["**/*.ts"]
}
```

## Configuration Files

```typescript {{title: 'tailor.config.ts'}}
import { defineConfig } from "@tailor-platform/sdk";

if (!process.env.WORKSPACE_ID) {
  throw new Error("WORKSPACE_ID environment variable is not set");
}

export default defineConfig({
  workspaceId: process.env.WORKSPACE_ID,
  name: "project-management",
  db: { "main-db": { files: [`./src/db/*.ts`] } },
});
```

> `db.enum()` takes a **single array argument**: `db.enum(["A", "B"])`, not `db.enum("A", "B")`.

```typescript {{title: 'src/db/user.ts'}}
import { db } from "@tailor-platform/sdk";

export const user = db.type("User", {
  name: db.string().description("Name of the user"),
  email: db.string().unique().description("Email address of the user"),
  role: db.enum(["MANAGER", "STAFF"]),
  ...db.fields.timestamps(),
});
```

```typescript {{title: 'src/db/project.ts'}}
import { db } from "@tailor-platform/sdk";

export const project = db.type("Project", {
  name: db.string().description("Name of the Project"),
  description: db.string({ optional: true }).description("Description of the project"),
  status: db.enum([
    { value: "PLANNING", description: "Planning status" },
    { value: "IN_PROGRESS", description: "In Progress status" },
    { value: "ON_HOLD", description: "On hold status" },
    { value: "COMPLETED", description: "Completed status" },
    { value: "CANCELED", description: "Canceled status" },
    { value: "CLOSED", description: "Closed status" },
  ]),
  startDate: db.date().description("Start date of the project"),
  endDate: db.date({ optional: true }).description("End date of the project"),
  ...db.fields.timestamps(),
});
```

```typescript {{title: 'src/db/task.ts'}}
import { db } from "@tailor-platform/sdk";
import { project } from "./project";
import { user } from "./user";

export const task = db.type("Task", {
  name: db.string().description("Name of the Task"),
  description: db.string({ optional: true }).description("Description of the task"),
  projectId: db
    .uuid()
    .description("ID of the project the task belongs to")
    .relation({ type: "n-1", toward: { type: project } }),
  assigneeId: db
    .uuid({ optional: true })
    .description("ID of the user assigned to the task")
    .relation({ type: "n-1", toward: { type: user } }),
  status: db.enum([
    { value: "TODO", description: "To Do status" },
    { value: "IN_PROGRESS", description: "In Progress status" },
    { value: "IN_REVIEW", description: "In Review status" },
    { value: "DONE", description: "Done status" },
    { value: "CANCELED", description: "Canceled status" },
  ]),
  dueDate: db.date().description("Due date of the task"),
  ...db.fields.timestamps(),
});
```

## File Tree

```
project-management/
├── package.json
├── tsconfig.json
├── tailor.config.ts
└── src/
    └── db/
        ├── user.ts
        ├── project.ts
        └── task.ts
```

## Deploy

```bash
npm install
export WORKSPACE_ID=your-workspace-id
npm run deploy
```

## Next Step

[Step 2: Add Authentication](/tutorials/develop-from-scratch/step-02)
