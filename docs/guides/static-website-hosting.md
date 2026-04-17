---
doc_type: guide
---

# Static Website Hosting

A static website hosting enables deployment of single page applications (SPAs) directly on Tailor Platform with optional IP-based access control and CDN caching.

## Configuration

Define static websites in your workspace configuration. Without IP restrictions, websites are automatically cached via CDN for optimal performance.

```typescript {{ title: "Static Website Configuration" }}
import { defineStaticWebsite } from "@tailor-platform/sdk";

// Basic static website
export const mySpa = defineStaticWebsite("my-spa", {
  description: "Single page application",
});

// With IP restrictions (disables caching)
export const internalApp = defineStaticWebsite("internal-app", {
  description: "Internal application with restricted access",
  allowedIpAddresses: ["198.51.100.0/24", "203.0.113.0/24"],
});
```

## Deployment

Deploy pre-built static files using TailorCLI. The service is designed for single page applications and will serve `index.html` for unmatched routes.

```bash {{ title: "Deploy Pre-built Files" }}
# Deploy your build output directory
tailor-sdk staticwebsite deploy \
  --name my-spa \
  --dir ./dist \
  --workspace_id <workspace-id>
```

## Caching Behavior

- **Public websites** (no IP restrictions): Automatically cached via CDN for optimal performance
- **Restricted websites** (with IP restrictions): Caching is disabled to ensure access control

## Using Generated URLs

Each static website receives a unique URL that can be used in your application configuration. After deploying your static website, you can reference its URL in your application's CORS settings or auth redirect URLs:

```typescript {{ title: "Using Static Website URL in Application Config" }}
import { defineTailorConfig } from "@tailor-platform/sdk";

export default defineTailorConfig({
  workspace: "my-workspace",
  app: {
    name: "my-app",
    // Add static website URL to CORS
    cors: ["https://my-spa-{WORKSPACE_HASH}.web.erp.dev"],
    subgraphs: [
      /* ... */
    ],
  },
});
```

The static website URL format is: `https://{static-website-name}-{WORKSPACE_HASH}.web.erp.dev`
