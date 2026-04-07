# Setting up Auth Connections

Auth connections enable your application to authenticate with external OAuth2 providers (such as Google, Microsoft 365, or QuickBooks) on behalf of itself, not on behalf of a user. Functions, executors, and workflows can then access those provider APIs at runtime using a managed access token.

- To follow along, first complete the [SDK Quickstart](../../sdk/quickstart) and [Setting up Auth](overview).

## What you'll build

A connection to Google's API that your resolvers and functions can use to call Google services without managing OAuth2 tokens manually.

## Tutorial Steps

1. Configure the connection in `defineAuth()`
2. Deploy the connection
3. Authorize the connection
4. Use the connection token at runtime
5. Manage connections via CLI

### 1. Configure the Connection

Add a `connections` block to your `defineAuth()` in `tailor.config.ts`:

```typescript
import { defineAuth } from "@tailor-platform/sdk";
import { idp } from "./idp";

export const auth = defineAuth("my-auth", {
  userProfile: {
    type: user,
    usernameField: "email",
  },
  idProvider: idp.provider("my-provider", "my-client"),
  connections: {
    "google-connection": {
      type: "oauth2",
      providerUrl: "https://accounts.google.com",
      issuerUrl: "https://accounts.google.com",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

**Connection config fields:**

| Field | Required | Description |
|---|---|---|
| `type` | Yes | Connection type. Currently only `"oauth2"`. |
| `providerUrl` | Yes | OAuth2 provider base URL. |
| `issuerUrl` | Yes | OAuth2 issuer URL for JWT validation. |
| `clientId` | Yes | Your OAuth2 app's client ID. |
| `clientSecret` | Yes | Your OAuth2 app's client secret. |
| `authUrl` | No | Override the authorization endpoint. |
| `tokenUrl` | No | Override the token endpoint. |

Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in your `.env` file or CI secrets. Never commit them.

### 2. Deploy the Connection

Run `tailor-sdk apply` to register the connection with the platform:

```bash
tailor-sdk apply
```

This creates the connection record. The connection exists but is not yet authorized (it has no tokens yet).

::: info Hash-based change detection
The SDK only re-deploys connections whose config has changed since the last `apply`. Delete `.tailor-sdk/` to force all connections to re-sync.
:::

### 3. Authorize the Connection

Run the authorize command to complete the OAuth2 flow:

```bash
tailor-sdk authconnection authorize --name google-connection \
  --scopes "openid,profile,email"
```

This opens a browser tab for the OAuth2 consent screen. After you approve, the platform exchanges the authorization code for tokens and stores them securely. Your app code never handles the tokens directly.

Verify the connection is authorized:

```bash
tailor-sdk authconnection list
```

### 4. Use the Connection Token at Runtime

Use `auth.getConnectionToken()` in a resolver, executor, or workflow to retrieve the current access token:

```typescript
// resolvers/fetch-google-profile.ts
import { createResolver, t } from "@tailor-platform/sdk";
import { auth } from "../tailor.config";

export default createResolver({
  name: "fetchGoogleProfile",
  operation: "query",
  input: {},
  output: t.object({
    email: t.string(),
    name: t.string(),
  }),
  body: async () => {
    const tokens = await auth.getConnectionToken("google-connection");

    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const profile = await response.json();
    return { email: profile.email, name: profile.name };
  },
});
```

The connection name is **type-checked**. If you rename or remove a connection from `defineAuth()`, TypeScript will flag any call sites immediately.

```typescript
// auth.getConnectionToken("unknown-connection"); // ❌ TypeScript error
```

### 5. Manage Connections via CLI

```bash
# List all connections and their status
tailor-sdk authconnection list

# Re-authorize a connection (e.g. token expired or scopes changed)
tailor-sdk authconnection authorize --name google-connection \
  --scopes "openid,profile,email,https://www.googleapis.com/auth/calendar"

# Revoke a connection
tailor-sdk authconnection revoke --name google-connection
```

## Complete Example: Calling an External API from an Executor

Here's a full executor that calls the Google Calendar API whenever a meeting record is created:

```typescript
// executor/sync-to-google-calendar.ts
import { createExecutor, recordCreatedTrigger } from "@tailor-platform/sdk";
import { auth } from "../tailor.config";
import { meeting } from "../db/meeting";

export default createExecutor({
  name: "sync-to-google-calendar",
  description: "Create a Google Calendar event when a meeting is scheduled",
  trigger: recordCreatedTrigger({ type: meeting }),
  operation: {
    kind: "function",
    body: async ({ newRecord }) => {
      const tokens = await auth.getConnectionToken("google-connection");

      await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: newRecord.title,
          start: { dateTime: newRecord.startTime },
          end: { dateTime: newRecord.endTime },
        }),
      });
    },
  },
});
```

## Next Steps

- [Auth Service](../../sdk/services/auth#auth-connections) - Full auth connections API reference
- [Built-in Interfaces](/guides/function/builtin-interfaces#auth-connection) - Runtime token API
- [Auth Guide](/guides/auth/authconnection) - Platform-level auth connection docs
- [Setting up Auth](overview) - Back to auth tutorial overview
