---
doc_type: guide
---

# Function service

## Overview

Function service lets you run your JavaScript code as serverless functions in Tailor Platform.
You can write your code and deploy it to Tailor Platform, and then trigger it from Pipeline resolvers or Executors.
This provides a flexible way to extend your application's functionality with custom business logic.

With Function service, you can:

- Send HTTP requests to 3rd party applications
- Access and execute SQL queries to Tailor DB
- Manage IdP users, secrets, files, and workflows via [built-in interfaces](/guides/function/builtin-interfaces)
- Process data transformations
- Implement custom business logic with npm packages

To keep the this guide simple, we'll focus on a basic example of writing a function that returns a greeting message.
For more advanced use cases, you can refer to these sections:

- [Built-in interfaces](/guides/function/builtin-interfaces) — all platform APIs available as global variables
- [Sending HTTP request](/guides/function/sending-request)
- [Accessing Tailor DB](/guides/function/accessing-tailordb)

## How to write and deploy your code in Function service

The deployment process involves three main steps:

1. Write your function
2. Set up the function in your Pipeline or Executor
3. Execute the function from your application

You can see the actual code examples [here](https://github.com/tailor-platform/templates/tree/main/docs/sample-inventory-management).

### 1. Writing Your Function

With SDK, functions are defined inline within the resolver or executor files using TypeScript.

### 2. Set up the function in your Pipeline resolver or Executor

#### Directory Structure

Here's the sample directory structure for an SDK project.
Your function code is defined inline within the resolver or executor files.

```sh {{ title: 'SDK directory structure' }}
.
├── tailor.config.ts
├── package.json
├── resolvers
│   └── function-sample-hello.ts
├── executors
│   └── webhook-function.ts
└── tailordb
    └── ...
```

#### Resolver Example

With SDK, the schema definition is inferred from the input/output types.
Here's a sample SDK configuration for setting up a resolver with a function:

```typescript {{ title: 'function-sample-hello.ts' }}
import { createResolver, t } from "@tailor-platform/sdk";

export default createResolver({
  name: "functionSampleHello",
  description: "query resolver for function sample",
  operation: "query",
  input: {
    message: t.string(),
  },
  body: (context) => {
    return {
      message: context.input.message,
    };
  },
  output: t.object({
    message: t.string().nullable(),
  }),
});
```

#### Executor incoming webhook Example

```typescript {{ title: 'webhook-function.ts' }}
import { createExecutor, incomingWebhookTrigger } from "@tailor-platform/sdk";

export default createExecutor({
  name: "sample-function-01",
  description: "sample function",
  trigger: incomingWebhookTrigger(),
  operation: {
    kind: "function",
    body: async () => {
      return {
        message: "hi " + new Date().toISOString(),
      };
    },
  },
});
```

Once you've defined the SDK configuration, you can deploy it to Tailor Platform.
Please confirm your tailor.config.ts points to your target workspace and run this command:

```bash
npx tailor deploy
```

### 3. Execute the function from your application

After deploying your function, you can open the graphql playground and run the query.

To open the graphql playground, run the following command:

```bash
npx tailor app open -n {APP_NAME}
```

Then, you can run the query in the playground:

```graphql
query {
  functionSampleHello(input: { message: "test" }) {
    message
  }
}
```

Function operations are subject to a recursive call depth limit of 10 levels when calling other platform services. See [Platform Limits](/reference/platform-limits#recursive-call-detection) for more details.

## Using the "user" variable

When using the Function service with Pipeline resolvers or Executors, you can access the current user's information using the `user` variable. This allows you to incorporate user-specific data into your functions.

The `user` variable has the following properties:

- `id`: The ID of the current user
- `type`: The type of the user
- `workspace_id`: The ID of the workspace the user belongs to
- `attributes`: The attributes of the user
- `tenant_id`: The ID of the tenant the user belongs to

### Resolver Example

In SDK, you can access the current user's information via `context.user` in the body function:

```typescript {{ title: 'function-sample-hello.ts' }}
import { createResolver, t } from "@tailor-platform/sdk";

export default createResolver({
  name: "functionSampleHello",
  description: "query resolver for function sample",
  operation: "query",
  input: {
    message: t.string(),
  },
  body: (context) => {
    return {
      message: context.user.id,
    };
  },
  output: t.object({
    message: t.string().nullable(),
  }),
});
```

#### Executor Example

```typescript {{ title: 'webhook-function.ts' }}
import { createExecutor, incomingWebhookTrigger } from "@tailor-platform/sdk";

export default createExecutor({
  name: "sample-function-01",
  description: "sample function",
  trigger: incomingWebhookTrigger(),
  operation: {
    kind: "function",
    body: async (context) => {
      return {
        message: "hi " + context.user.id,
      };
    },
  },
});
```

## Further details

For more advanced use cases, you can refer to these sections:

- [Built-in interfaces](/guides/function/builtin-interfaces) — all platform APIs available as global variables (IdP, secrets, files, workflows, etc.)
- [Sending HTTP request](/guides/function/sending-request)
- [Accessing Tailor DB](/guides/function/accessing-tailordb)

For list of supported packages, please refer to [Appendix](/guides/function/appendix).
