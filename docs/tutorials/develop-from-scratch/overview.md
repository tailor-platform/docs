# Develop from Scratch with Tailor Platform SDK

Build a project management app with database types, auth, resolvers, and executors using TypeScript.

## Prerequisites

- **Node.js 22+**
- **Tailor Platform workspace** — create one at [console.tailor.tech](https://console.tailor.tech). Note your workspace ID.

## Steps

| Step                                                                  | What's Added                                    | Key Files                                                          |
| --------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| [Step 1: Database Schema](/tutorials/develop-from-scratch/step-01)    | Project scaffolding, User/Project/Task types    | `package.json`, `tsconfig.json`, `tailor.config.ts`, `src/db/*.ts` |
| [Step 2: Auth & Permissions](/tutorials/develop-from-scratch/step-02) | Auth namespace, machine users, permission rules | `src/common/permission.ts`, updated `src/db/*.ts`                  |
| [Step 3: Resolver](/tutorials/develop-from-scratch/step-03)           | closeProject mutation, Kysely type generator    | `src/resolver/closeProject.ts`, `src/generated/tailordb.ts`        |
| [Step 4: Executor](/tutorials/develop-from-scratch/step-04)           | Slack notification on task creation             | `src/executor/newTaskSlackNotification.ts`                         |

## Final File Tree

```
project-management/
├── package.json
├── tsconfig.json
├── tailor.config.ts
└── src/
    ├── common/permission.ts
    ├── db/
    │   ├── user.ts
    │   ├── project.ts
    │   └── task.ts
    ├── generated/tailordb.ts        # auto-generated
    ├── resolver/closeProject.ts
    └── executor/newTaskSlackNotification.ts
```

## Code Repository

[github.com/tailor-platform/templates/tree/main/docs/build-from-scratch/sdk](https://github.com/tailor-platform/templates/tree/main/docs/build-from-scratch/sdk)

## Additional Resources

- [Tailor Platform SDK Documentation](../../sdk/quickstart)
- [TailorDB Service](../../sdk/services/tailordb)
- [Resolver Service](../../sdk/services/resolver)
- [Executor Service](../../sdk/services/executor)
- [Auth Service](../../sdk/services/auth)
