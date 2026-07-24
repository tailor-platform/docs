---
doc_type: guide
---

# Creating Workflows

Workflows are defined using the Tailor Platform SDK with TypeScript. This approach provides type safety, version control, and seamless integration with other platform services.

## Directory Structure

```
  src/
  ├── workflows/
  │   ├── order-processing.ts    # Workflow definition
  │   └── steps/
  │       ├── validate-order.ts
  │       ├── check-inventory.ts
  │       └── process-payment.ts
  └── index.ts
```

## Defining Workflow Steps

In the SDK, workflow steps are defined as TypeScript functions. Each step contains its logic and is composable:

```typescript {{ title: 'workflows/steps/validate-order.ts' }}
import { WorkflowStep } from "@tailor-platform/sdk";

export const validateOrderStep: WorkflowStep = {
  name: "validate-order",
  handler: async (args) => {
    if (!args.orderId) {
      throw new Error("orderId is required");
    }
    // Validation logic
    return { validated: true, orderId: args.orderId };
  },
};
```

```typescript {{ title: 'workflows/steps/check-inventory.ts' }}
import { WorkflowStep } from "@tailor-platform/sdk";

export const checkInventoryStep: WorkflowStep = {
  name: "check-inventory",
  handler: async (args) => {
    // Inventory check logic
    return { inStock: true, orderId: args.orderId };
  },
};
```

```typescript {{ title: 'workflows/steps/process-payment.ts' }}
import { WorkflowStep } from "@tailor-platform/sdk";

export const processPaymentStep: WorkflowStep = {
  name: "process-payment",
  handler: async (args) => {
    // Payment processing logic
    return { paymentId: "pay_123", status: "completed" };
  },
};
```

## Defining Workflows

Create a workflow that composes multiple steps:

```typescript {{ title: 'workflows/order-processing.ts' }}
import { createWorkflow } from "@tailor-platform/sdk";
import { validateOrderStep } from "./steps/validate-order";
import { checkInventoryStep } from "./steps/check-inventory";
import { processPaymentStep } from "./steps/process-payment";

export const orderProcessingWorkflow = createWorkflow({
  name: "order-processing",
  steps: [validateOrderStep, checkInventoryStep, processPaymentStep],
});
```

**Properties:**

- `name` (String, Required) - Workflow name (unique within workspace)
- `steps` (Array, Required) - Array of workflow steps to execute

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
npx tailor workflow start <workflow-name> --args '{"orderId": "123"}'
```

## Writing Step Functions

Workflow steps are TypeScript functions that form the building blocks of your workflow. Each step function receives input arguments and returns output:

```typescript
export const myStep: WorkflowStep = {
  name: "my-step",
  handler: async (args) => {
    // Your code here
    return { result: "success" };
  },
};
```

**Function signature:**

- **Input**: `args` object with type safety
- **Output**: JSON-serializable object
- **Async/await**: Supported for asynchronous operations

### Composing Steps

In SDK workflows, steps are executed sequentially by the workflow engine. Data flows from one step to the next:

```typescript
import { createWorkflow } from "@tailor-platform/sdk";

export const myWorkflow = createWorkflow({
  name: "my-workflow",
  steps: [
    {
      name: "step1",
      handler: async (args) => {
        return { data: "from step 1" };
      },
    },
    {
      name: "step2",
      handler: async (args) => {
        // Access output from previous step
        console.log(args.data); // "from step 1"
        return { result: "complete" };
      },
    },
  ],
});
```

### Example: Multi-step workflow

Here's a complete example showing how to compose multiple job functions:

```javascript {{ title: 'main.js' }}
export function main(args) {
  console.log("Starting workflow with orderId:", args.orderId);

  // Step 1: Fetch order data
  const order = tailor.workflow.startJobFunction("fetchOrder", {
    orderId: args.orderId,
  });

  // Step 2: Validate order
  const validated = tailor.workflow.startJobFunction("validateOrder", order);

  // Step 3: Process payment
  const payment = tailor.workflow.startJobFunction("processPayment", {
    orderId: validated.id,
    amount: validated.total,
  });

  // Step 4: Send confirmation
  tailor.workflow.startJobFunction("sendConfirmation", {
    orderId: validated.id,
    email: validated.customerEmail,
    paymentId: payment.id,
  });

  return {
    orderId: validated.id,
    paymentId: payment.id,
  };
}
```

```javascript {{ title: 'deps/fetchOrder.js' }}
export function main(args) {
  console.log("Fetching order:", args.orderId);

  // Simulate fetching from API
  return {
    id: args.orderId,
    customerEmail: "customer@example.com",
    items: [{ name: "Product A", price: 100 }],
    total: 100,
  };
}
```

```javascript {{ title: 'deps/validateOrder.js' }}
export function main(args) {
  console.log("Validating order:", args.id);

  if (!args.items || args.items.length === 0) {
    throw new Error("Order has no items");
  }

  if (!args.customerEmail) {
    throw new Error("Customer email is required");
  }

  return args; // Return validated order
}
```

### Error Handling

Throw errors to mark a job function as failed:

```javascript
export function main(args) {
  if (!args.requiredField) {
    throw new Error("requiredField is missing");
  }

  try {
    // Risky operation
    const result = performOperation();
    return { result };
  } catch (error) {
    throw new Error(`Operation failed: ${error.message}`);
  }
}
```

When an error occurs:

- The workflow execution is marked as `failed`
- The error message and stack trace are saved
- The workflow can be resumed using the `resume` command

### Logging

Use `console.log()` for logging:

```javascript
export function main(args) {
  console.log("Processing started");
  console.log("Input:", JSON.stringify(args));

  // Your code

  console.log("Processing completed");
  return { status: "done" };
}
```
