---
doc_type: guide
---

# Static Website Hosting

A static website hosting enables deployment of single page applications (SPAs) directly on Tailor Platform with optional IP-based access control and CDN caching.

## Configuration

Define static websites in your workspace configuration. Without IP restrictions, websites are automatically cached via CDN for optimal performance.

```typescript {{ title: "Static Website Configuration" }}
import { defineStaticWebSite } from "@tailor-platform/sdk";

// Basic static website
export const mySpa = defineStaticWebSite("my-spa", {
  description: "Single page application",
});

// With IP restrictions (disables caching)
export const internalApp = defineStaticWebSite("internal-app", {
  description: "Internal application with restricted access",
  allowedIpAddresses: ["198.51.100.0/24", "203.0.113.0/24"],
});
```

## Deployment

Deploy pre-built static files using TailorCLI. The service is designed for single page applications and will serve `index.html` for unmatched routes.

```bash {{ title: "Deploy Pre-built Files" }}
# Deploy your build output directory
tailor staticwebsite deploy \
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
    subgraphs: [/* ... */],
  },
});
```

The static website URL format is: `https://{static-website-name}-{WORKSPACE_HASH}.web.erp.dev`

## Custom Domains

You can use your own subdomain (e.g. `app.example.com`) instead of the auto-generated URL. Apex domains (e.g. `example.com`) are not yet supported. A domain can only belong to one static website. Adding a domain that is already in use will fail.

Each static website supports up to 10 custom domains. After adding a domain, you need to configure DNS CNAME records to complete the setup.

### Adding Custom Domains

There are two ways to add custom domains to a static website.

#### SDK Configuration

Add the `customDomains` field to your `defineStaticWebSite()` definition. Domains are provisioned automatically when you run `tailor deploy`.

```typescript {{ title: "Static Website with Custom Domains" }}
import { defineStaticWebSite } from "@tailor-platform/sdk";

export const mySpa = defineStaticWebSite("my-spa", {
  description: "Single page application",
  customDomains: ["app.example.com"],
});
```

#### CLI

Use the API command to add a custom domain directly.

```bash {{ title: "Add a Custom Domain" }}
tailor api AddCustomDomain --body '{
  "workspace_id": "<workspace-id>",
  "static_website_name": "my-spa",
  "domain": "app.example.com"
}'
```

You can list and inspect custom domains with dedicated subcommands:

```bash {{ title: "List and Get Custom Domains" }}
# List all custom domains for a static website
tailor staticwebsite domain list my-spa

# Get details of a specific custom domain
tailor staticwebsite domain get app.example.com
```

### DNS Configuration

After adding a custom domain, configure CNAME records with your DNS provider. The required targets are returned in the response and can also be retrieved with `tailor staticwebsite domain get`.

| Record Type | Host                              | Target                            | Purpose                                  |
| ----------- | --------------------------------- | --------------------------------- | ---------------------------------------- |
| CNAME       | `app.example.com`                 | Value of `trafficCnameTarget`     | Routes traffic to the CDN                |
| CNAME       | `_acme-challenge.app.example.com` | Value of `certificateCnameTarget` | TLS certificate issuance (DNS challenge) |

For new domains, setting the traffic CNAME is sufficient. The TLS certificate is issued automatically via HTTP challenge. If you are migrating from another service and cannot switch traffic yet, set the `_acme-challenge` record first to issue the certificate via DNS challenge, then update the traffic CNAME when ready.

### Domain Status

Custom domains progress through the following statuses:

| Status        | Description                                          |
| ------------- | ---------------------------------------------------- |
| `pending`     | Domain registered, challenge not yet started         |
| `verifying`   | Challenge in progress, verifying certificate         |
| `cert_issued` | TLS certificate issued, waiting for traffic CNAME    |
| `active`      | TLS certificate active and domain is serving traffic |
| `failed`      | Provisioning failed (see `errorMessage` for details) |

If the challenge does not complete within 7 days, the domain is automatically removed. To retry, add the domain again.
