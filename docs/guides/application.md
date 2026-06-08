---
doc_type: guide
---

# Application

By creating an application manifest, you can create your API endpoint for the services you use.
This API endpoint will provide all the Queries and Mutations of each service, including those you defined.

In the spec property, the following child properties can be defined:

**Properties**

- `Name`: The gateway name. Name of the gateway that will be used as the application's subdomain, e.g. setting `Name` to `my-app` will create API endpoints at `my-app-{WORKSPACE_HASH}.erp.dev/query`. Cannot duplicate a NAME that is being used by other users. **(required)**
- `Cors`: The origins. Defines the origin to which requests are allowed.
- `AllowedIPAddresses`: A list of IP addresses authorized to access the application, preventing unauthorized access. Each entry is a string in the format CIDR. Example: `["1.1.1.1/32", "2.2.2.0/24"]`. To restrict access more broadly across an organization or folder, see [IP Restriction](/administration/ip-restriction).
- `Auth`: The authentication service. Defines the authentication service to be used.
- `Subgraphs`: The services you use.

To deploy an application, you'll need to enable at least one service.

**Example**

```typescript
import { defineTailorConfig } from "@tailor-platform/sdk";

export default defineTailorConfig({
  workspace: "my-workspace",
  app: {
    name: "my-app",
    subgraphs: [tailordb, auth, pipeline],
  },
});
```
