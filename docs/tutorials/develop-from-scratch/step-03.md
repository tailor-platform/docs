# Step 3: Add Resolver

Add a `closeProject` mutation that cancels incomplete tasks and closes a project in a transaction. Also adds an `admin` machine user and Kysely type generator.

[Source code on GitHub](https://github.com/tailor-platform/templates/tree/main/docs/build-from-scratch/sdk/step-03)

## Configuration Files

Changes from Step 2: added `admin` machine user, `resolver` namespace, and `plugins` export.

> Since the `admin` machine user uses `role: "ADMIN"`, update `src/db/user.ts` to include it: `db.enum(["MANAGER", "STAFF", "ADMIN"])`.

```typescript {{title: 'tailor.config.ts'}}
import { defineAuth, defineConfig, definePlugins } from "@tailor-platform/sdk";
import { kyselyTypePlugin } from "@tailor-platform/sdk/plugin/kysely-type";
import { user } from "./src/db/user";

export default defineConfig({
  name: "project-management",
  db: { "main-db": { files: [`./src/db/*.ts`] } },
  auth: defineAuth("main-auth", {
    userProfile: {
      type: user,
      usernameField: "email",
      attributes: {
        role: true,
      },
    },
    machineUsers: {
      manager: {
        attributes: { role: "MANAGER" },
      },
      staff: {
        attributes: { role: "STAFF" },
      },
      admin: {
        attributes: { role: "ADMIN" },
      },
    },
  }),
  resolver: { "main-resolver": { files: [`./src/resolver/*.ts`] } },
});

export const plugins = definePlugins(kyselyTypePlugin({ distPath: `./src/generated/tailordb.ts` }));
```

> For optional output fields, use `t.string({ optional: true })`, not `t.string().optional()`. The `.optional()` chain does not exist.

```typescript {{title: 'src/resolver/closeProject.ts'}}
import { createResolver, t } from "@tailor-platform/sdk";
import { getDB } from "../generated/tailordb";

export default createResolver({
  name: "closeProject",
  operation: "mutation",
  input: {
    id: t.string(),
  },
  body: async (context) => {
    const db = getDB("main-db");

    // 1. Fetch the project
    const project = await db
      .selectFrom("Project")
      .selectAll()
      .where("id", "=", context.input.id)
      .executeTakeFirst();

    if (!project) {
      throw new Error(`Project not found, expected:1 got:0`);
    }

    if (project.status === "CLOSED") {
      return { result: "Project is already closed." };
    }

    // 2. Get all incomplete tasks for the project
    const incompleteTasks = await db
      .selectFrom("Task")
      .selectAll()
      .where("projectId", "=", context.input.id)
      .where("status", "!=", "DONE")
      .execute();

    // 3. Start a transaction
    await db.transaction().execute(async (trx: any) => {
      // Mark all incomplete tasks as canceled
      for (const task of incompleteTasks) {
        await trx
          .updateTable("Task")
          .set({ status: "CANCELED" })
          .where("id", "=", task.id)
          .execute();
      }
      // Close the project
      await trx
        .updateTable("Project")
        .set({ status: "CLOSED" })
        .where("id", "=", context.input.id)
        .execute();
    });

    return {
      result: `${context.input.id} project has been closed. All incomplete tasks are marked as canceled.`,
    };
  },
  output: t.object({
    result: t.string({ optional: true }),
  }),
});
```

## File Tree

```
project-management/
├── package.json
├── tsconfig.json
├── tailor.config.ts
└── src/
    ├── common/permission.ts
    ├── db/
    │   ├── user.ts                    # Updated: add ADMIN to role enum
    │   ├── project.ts
    │   └── task.ts
    ├── generated/
    │   └── tailordb.ts                # Auto-generated
    └── resolver/
        └── closeProject.ts            # New
```

## Deploy

> You must run `generate` before `deploy` whenever you add or change database types.

```bash
npm run generate
npm run deploy
```

## Verify

```graphql
mutation {
  closeProject(input: { id: "project-uuid-here" }) {
    result
  }
}
```

## Next Step

[Step 4: Add Executor](/tutorials/develop-from-scratch/step-04)
