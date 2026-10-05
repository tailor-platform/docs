---
description: "Define a workflow and its steps in TypeScript with the SDK: project layout, step functions, execution policies and deployment."
doc_type: guide
sdk_version: "2.25.0"
---

# Creating Workflows

Workflows are defined using the Tailor Platform SDK with TypeScript. This approach provides type safety, version control, and seamless integration with other platform services.

## Directory Structure

```
  src/
  ├── workflows/
  │   ├── order-processing.ts    # Workflow definition
  │   └── jobs/
  │       ├── validate-order.ts
  │       ├── check-inventory.ts
  │       └── process-payment.ts
  └── index.ts
```

## Defining Workflow Jobs

In the SDK, the steps of a workflow are defined as jobs with `createWorkflowJob`. Each job contains its logic and is composable. A job must be a named export, its `name` must be a string literal, and its `body` must be written inline as a function expression:

```typescript {{ title: 'workflows/jobs/validate-order.ts' }}
import { createWorkflowJob } from "@tailor-platform/sdk";

export const validateOrder = createWorkflowJob({
  name: "validate-order",
  body: async (input: { orderId: string }) => {
    if (!input.orderId) {
      throw new Error("orderId is required");
    }
    // Validation logic
    return { validated: true, orderId: input.orderId };
  },
});
```

```typescript {{ title: 'workflows/jobs/check-inventory.ts' }}
import { createWorkflowJob } from "@tailor-platform/sdk";

export const checkInventory = createWorkflowJob({
  name: "check-inventory",
  body: async (input: { orderId: string }) => {
    // Inventory check logic
    return { inStock: true, orderId: input.orderId };
  },
});
```

```typescript {{ title: 'workflows/jobs/process-payment.ts' }}
import { createWorkflowJob } from "@tailor-platform/sdk";

export const processPayment = createWorkflowJob({
  name: "process-payment",
  body: async (input: { orderId: string }) => {
    // Payment processing logic
    return { paymentId: "pay_123", status: "completed" };
  },
});
```

## Defining Workflows

Create a workflow whose main job composes the other jobs. The workflow must be the **default export** of its file:

```typescript {{ title: 'workflows/order-processing.ts' }}
import { createWorkflow, createWorkflowJob } from "@tailor-platform/sdk";
import { validateOrder } from "./jobs/validate-order";
import { checkInventory } from "./jobs/check-inventory";
import { processPayment } from "./jobs/process-payment";

export const processOrder = createWorkflowJob({
  name: "process-order",
  body: (input: { orderId: string }) => {
    const validation = validateOrder.start({ orderId: input.orderId });
    const inventory = checkInventory.start({ orderId: validation.orderId });
    const payment = processPayment.start({ orderId: validation.orderId });
    return { ...payment, inStock: inventory.inStock };
  },
});

export default createWorkflow({
  name: "order-processing",
  mainJob: processOrder,
});
```

**Properties:**

- `name` (String, Required) - Workflow name (unique within workspace)
- `mainJob` (WorkflowJob, Required) - The job that runs first and orchestrates the other jobs
- `retryPolicy` (Object, Optional) - Retry policy applied to the workflow
- `concurrencyPolicy` (Object, Optional) - Caps how many executions of this workflow run at once
- `publishEvents` (Boolean, Optional) - Publish this workflow's execution events

## Versioning

Job functions are automatically versioned:

- When a job function's script changes, a new version is created
- Unchanged scripts reuse the existing version
- Workflows can reference specific versions or always use the latest

## Managing Workflows

**List workflows:**

```bash
npx tailor workflow list
```

**Get workflow details:**

```bash
npx tailor workflow get <workflow-name>
```

**Start a workflow execution:**

```bash
npx tailor workflow start <workflow-name> --machine-user admin --arg '{"orderId": "123"}'
```

## Writing Job Functions

Workflow jobs are TypeScript functions that form the building blocks of your workflow. Each job body receives its input and returns output:

```typescript
import { createWorkflowJob } from "@tailor-platform/sdk";

export const myJob = createWorkflowJob({
  name: "my-job",
  body: async (input: { id: string }) => {
    // Your code here
    return { result: "success" };
  },
});
```

**Function signature:**

- **Input**: `input` object with type safety. Must be JSON-serializable
- **Output**: JSON-serializable object
- **Async/await**: Supported for asynchronous operations
- **Context**: An optional second argument carries `env` and `invoker`

### Composing Jobs

Jobs call each other with `.start()`, which runs the job and returns its result. Data flows from one job to the next:

```typescript
import { createWorkflow, createWorkflowJob } from "@tailor-platform/sdk";

export const step1 = createWorkflowJob({
  name: "step1",
  body: async () => {
    return { data: "from step 1" };
  },
});

export const step2 = createWorkflowJob({
  name: "step2",
  body: async (input: { data: string }) => {
    // Access output from the previous job
    console.log(input.data); // "from step 1"
    return { result: "complete" };
  },
});

export const myMainJob = createWorkflowJob({
  name: "my-main-job",
  body: () => {
    const first = step1.start();
    return step2.start({ data: first.data });
  },
});

export default createWorkflow({
  name: "my-workflow",
  mainJob: myMainJob,
});
```

`.start()` must be called from inside another job's `body`. The build rewrites those calls into platform job dispatches, and fails if it cannot see the call.

### Example: Multi-step workflow

Here's a complete example showing how to compose multiple job functions:

```typescript {{ title: 'workflows/order.ts' }}
import { createWorkflow, createWorkflowJob } from "@tailor-platform/sdk";

export const fetchOrder = createWorkflowJob({
  name: "fetch-order",
  body: (input: { orderId: string }) => {
    console.log("Fetching order:", input.orderId);

    // Simulate fetching from API
    return {
      id: input.orderId,
      customerEmail: "customer@example.com",
      items: [{ name: "Product A", price: 100 }],
      total: 100,
    };
  },
});

export const validateOrder = createWorkflowJob({
  name: "validate-order",
  body: (input: {
    id: string;
    customerEmail: string;
    items: { name: string; price: number }[];
    total: number;
  }) => {
    console.log("Validating order:", input.id);

    if (!input.items || input.items.length === 0) {
      throw new Error("Order has no items");
    }

    if (!input.customerEmail) {
      throw new Error("Customer email is required");
    }

    return input; // Return validated order
  },
});

export const processPayment = createWorkflowJob({
  name: "process-payment",
  body: (input: { orderId: string; amount: number }) => {
    return { id: `pay_${input.orderId}`, amount: input.amount };
  },
});

export const sendConfirmation = createWorkflowJob({
  name: "send-confirmation",
  body: (input: { orderId: string; email: string; paymentId: string }) => {
    console.log("Sending confirmation to:", input.email);
    return { sent: true };
  },
});

export const processOrder = createWorkflowJob({
  name: "process-order",
  body: (input: { orderId: string }) => {
    console.log("Starting workflow with orderId:", input.orderId);

    // Step 1: Fetch order data
    const order = fetchOrder.start({ orderId: input.orderId });

    // Step 2: Validate order
    const validated = validateOrder.start(order);

    // Step 3: Process payment
    const payment = processPayment.start({
      orderId: validated.id,
      amount: validated.total,
    });

    // Step 4: Send confirmation
    sendConfirmation.start({
      orderId: validated.id,
      email: validated.customerEmail,
      paymentId: payment.id,
    });

    return {
      orderId: validated.id,
      paymentId: payment.id,
    };
  },
});

export default createWorkflow({
  name: "order-processing-example",
  mainJob: processOrder,
});
```

### Error Handling

Throw errors to mark a job function as failed:

```typescript
export const riskyJob = createWorkflowJob({
  name: "risky-job",
  body: (input: { requiredField?: string }) => {
    if (!input.requiredField) {
      throw new Error("requiredField is missing");
    }

    try {
      // Risky operation
      const result = performOperation();
      return { result };
    } catch (error) {
      throw new Error(`Operation failed: ${(error as Error).message}`);
    }
  },
});
```

When an error occurs:

- The workflow execution is marked as `failed`
- The error message and stack trace are saved
- The workflow can be resumed using the `resume` command

### Logging

Use `console.log()` for logging:

```typescript
export const loggingJob = createWorkflowJob({
  name: "logging-job",
  body: (input: { id: string }) => {
    console.log("Processing started");
    console.log("Input:", JSON.stringify(input));

    // Your code

    console.log("Processing completed");
    return { status: "done" };
  },
});
```
