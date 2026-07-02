---
doc_type: guide
---

# AuthConnection

AuthConnection enables OAuth2 authentication connections with external providers, featuring server-side secret management and seamless Function runtime integration. Unlike traditional auth integrations focused on user authentication, AuthConnection is designed for application-to-application OAuth2 flows where your functions need to access external APIs on behalf of your application.

## Overview

AuthConnection provides a secure way to:

- Manage OAuth2 connections with external providers (Google, Microsoft 365, QuickBooks)
- Store client secrets server-side eliminating client-side secret exposure
- Access tokens from Functions
- Handle token refresh automatically for long-running integrations

## Prerequisites

- A Tailor Platform workspace with Auth service enabled
- OAuth2 application configured with your chosen provider
- Basic understanding of OAuth2 flows
- Function service enabled (for runtime integration)
- An SDK project with a `tailor.config.ts` — see the [SDK Quickstart](/sdk/quickstart)

## Setup Flow

An auth connection can be managed two ways: through your **SDK config** (`defineAuth()` in `tailor.config.ts`, deployed with the rest of your app) or entirely through the **Console**. Either way, setting up a connection is two steps:

1. **Create** the connection (registers the OAuth2 provider credentials)
2. **Authorize** the connection (runs the OAuth2 flow to obtain and store tokens)

A given connection can only be managed by one side at a time — see [Choosing a Management Method](#choosing-a-management-method) below.

### Option A: Manage via SDK Config

#### 1. Configure the Connection

Add a `connections` block to `defineAuth()` in `tailor.config.ts`:

```typescript
import { defineAuth } from "@tailor-platform/sdk";

export const auth = defineAuth("my-auth", {
  // ...other auth config
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

Store the client ID and secret in your `.env` file or CI secrets — never commit them.

**Connection config fields:**

| Field          | Type     | Required | Description                                  |
| -------------- | -------- | -------- | --------------------------------------------- |
| `type`         | `string` | Yes      | Connection type. Currently only `"oauth2"`.  |
| `providerUrl`  | `string` | Yes      | OAuth2 provider URL.                          |
| `issuerUrl`    | `string` | Yes      | Token issuer URL for JWT validation.          |
| `clientId`     | `string` | Yes      | OAuth2 client ID from the provider.           |
| `clientSecret` | `string` | Yes      | OAuth2 client secret from the provider.       |
| `authUrl`      | `string` | No       | Override for the authorization endpoint.      |
| `tokenUrl`     | `string` | No       | Override for the token endpoint.              |

Deploy to register the connection with the platform:

```bash
tailor-sdk deploy
```

This creates (or updates) the connection record. A newly created connection exists but is not yet authorized — it has no tokens yet.

> [!NOTE]
> Deploy updates existing connections **in-place**, preserving the OAuth token. If a change requires re-authorization (for example, the provider URL or client ID changed), the deploy will warn you to run `authconnection authorize` again.

> [!TIP]
> Once a connection has been deployed at least once, later deploys can pass `clientSecret: ""` (an empty string) without erasing the secret already stored on the platform — an empty value is simply left out of the update, so nothing about the secret changes. This lets a CI pipeline redeploy an existing connection (for example, to pick up a `providerUrl` change) without ever having access to the real secret. The very first deploy that creates the connection still needs the real secret at least once, from wherever that value is available. Set the environment variable to an explicit empty string (e.g. `GOOGLE_CLIENT_SECRET=` in CI) rather than leaving it unset — `clientSecret` is a required field, so an `undefined` value fails config validation before deploy even runs.

#### 2. Authorize the Connection

```bash
tailor-sdk authconnection authorize --name google-connection \
  --scopes "openid,profile,email" \
  --port 8080
```

**Parameters:**

- `--name` (required): Name of the connection defined in `defineAuth()`
- `--scopes` (optional): OAuth2 scopes to request (default: `openid,profile,email`)
- `--port` (optional): Local callback server port (default: `8080`)
- `--no-browser` (optional): Don't open browser automatically

This command:

1. Starts a local HTTP server for the OAuth2 callback
2. Opens your browser to the provider's authorization page
3. Handles the callback after authorization
4. Exchanges the authorization code for tokens using the client secret from your config
5. Stores tokens securely on the server

Alternatively, run `tailor-sdk authconnection open` to authorize the connection from the Console instead of the local CLI flow — useful on a machine without browser access:

```bash
tailor-sdk authconnection open
```

Verify the connection is authorized:

```bash
tailor-sdk authconnection list
```

### Option B: Manage Entirely via the Console

No `tailor.config.ts` changes are needed — create, authorize, and manage the connection directly in the Tailor Platform Console:

```bash
tailor-sdk authconnection open
```

This opens the workspace's connections settings page, where you can:

1. **Create** a new connection — enter the type, provider URL, issuer URL, client ID, and client secret directly in the Console form
2. **Authorize** it — the Console walks you through the OAuth2 consent flow in the browser
3. View its status, re-authorize, revoke its tokens, or delete it later from the same page

This is a good fit for connections you don't want tracked in git — for example, ones that differ per developer, or that only ever target a single shared workspace and don't need to travel with the rest of your app's config.

### Choosing a Management Method

A connection name is owned by exactly one side at a time — the same connection cannot be managed by both the Console and your SDK config simultaneously:

- A connection created via the Console (Option B) carries no SDK ownership label. `tailor-sdk deploy` leaves it completely untouched as long as it isn't also declared in `connections`.
- If you later add a connection with the **same name** to `defineAuth()`'s `connections` and run `deploy`, the SDK finds it already exists without an ownership label and pauses to ask whether it should take it over ("Allow tailor-sdk to manage these resources?"). Confirming adopts it into config management — from that point on, every `deploy` overwrites its fields to match your config, and removing it from `connections` deletes the connection. (`--yes` confirms automatically, which is useful for CI but means this adoption happens without a prompt.)
- Until you confirm that handover, `deploy` refuses to proceed, so a Console-managed connection is never silently overwritten by config just because a connection with the same name appears in `tailor.config.ts`.

In short: use the Console (Option B) for connections you intend to manage by hand, and SDK config (Option A) for connections you want defined, reviewed, and deployed alongside the rest of your app. Don't mix the two for the same connection name.

## Provider Configuration Examples

### Google OAuth2

First, create OAuth2 credentials in [Google Cloud Console](https://console.cloud.google.com/):

1. Go to "APIs & Services" > "Credentials"
2. Create OAuth 2.0 Client ID
3. Configure authorized redirect URIs

```typescript
connections: {
  "google-oauth": {
    type: "oauth2",
    providerUrl: "https://accounts.google.com",
    issuerUrl: "https://accounts.google.com",
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
},
```

```bash
# 1. Deploy the connection
tailor-sdk deploy

# 2. Authorize and get tokens
tailor-sdk authconnection authorize --name google-oauth \
  --scopes "https://www.googleapis.com/auth/admin.directory.user.readonly"
```

**Common Google OAuth2 URLs:**

- Authorization endpoint: `https://accounts.google.com/o/oauth2/v2/auth`
- Token endpoint: `https://oauth2.googleapis.com/token`
- User info endpoint: `https://www.googleapis.com/oauth2/v2/userinfo`

### Microsoft 365 / Azure AD

First, register an application in [Azure Portal](https://portal.azure.com/):

1. Go to "Azure Active Directory" > "App registrations"
2. Create new registration
3. Configure redirect URIs under "Authentication"
4. Create client secret under "Certificates & secrets"

```typescript
connections: {
  "ms365-oauth": {
    type: "oauth2",
    providerUrl: "https://login.microsoftonline.com/YOUR_TENANT_ID",
    issuerUrl: "https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0",
    clientId: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
  },
},
```

```bash
# 1. Deploy the connection
tailor-sdk deploy

# 2. Authorize and get tokens
tailor-sdk authconnection authorize --name ms365-oauth \
  --scopes "https://graph.microsoft.com/.default"
```

Replace `YOUR_TENANT_ID` with your Azure AD tenant ID or use `common` for multi-tenant applications.

**Common Microsoft OAuth2 URLs:**

- Authorization endpoint: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize`
- Token endpoint: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`
- User info endpoint: `https://graph.microsoft.com/v1.0/me`

### QuickBooks OAuth2

First, create an app in [Intuit Developer Portal](https://developer.intuit.com/):

1. Create a new app
2. Select OAuth 2.0 for authorization
3. Configure redirect URIs
4. Get your client ID and secret from "Keys & OAuth"

```typescript
connections: {
  "quickbooks-oauth": {
    type: "oauth2",
    providerUrl: "https://appcenter.intuit.com/connect/oauth2",
    issuerUrl: "https://oauth.platform.intuit.com/op/v1",
    clientId: process.env.QUICKBOOKS_CLIENT_ID!,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
  },
},
```

```bash
tailor-sdk deploy
```

**Common QuickBooks OAuth2 URLs:**

- Authorization endpoint: `https://appcenter.intuit.com/connect/oauth2`
- Token endpoint: `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer`
- User info endpoint: `https://accounts.platform.intuit.com/v1/openid_connect/userinfo`

**QuickBooks Scopes:**

- `com.intuit.quickbooks.accounting` - QuickBooks Online API
- `com.intuit.quickbooks.payment` - Payments API
- `openid` - OpenID Connect
- `profile` - User profile information
- `email` - User email address

## Function Runtime Integration

AuthConnection integrates seamlessly with the Function service, allowing your functions to access OAuth2 tokens and call external APIs.

### Basic Usage

Use `authconnection.getConnectionToken()` from `@tailor-platform/sdk/runtime` to retrieve the current access token by connection name. When `connections` is defined in `defineAuth()`, the connection name is type-checked and autocompleted against the defined keys:

```typescript
import { authconnection } from "@tailor-platform/sdk/runtime";

export default async () => {
  // Get access token for a connection
  const tokens = await authconnection.getConnectionToken("google-oauth");

  // Use the access token to call external APIs
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`);
  }

  const userInfo = await response.json();
  return userInfo;
};
```

```typescript
// authconnection.getConnectionToken("unknown-connection"); // ❌ TypeScript error
```

Type narrowing is provided by the generated `tailor.d.ts` (the `ConnectionNameRegistry` interface). Run `tailor-sdk generate` (or `deploy`) after defining new connections to refresh it. Before the first generate, or when `connections` is not defined in `defineAuth()`, `getConnectionToken()` accepts any string.

### Advanced Usage with Error Handling

```typescript
import { authconnection } from "@tailor-platform/sdk/runtime";

export default async () => {
  try {
    // Get tokens for multiple connections
    const googleTokens = await authconnection.getConnectionToken("google-oauth");
    const msTokens = await authconnection.getConnectionToken("ms365-oauth");

    // Call Google API
    const googleResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${googleTokens.access_token}`,
      },
    });

    // Call Microsoft Graph API
    const msResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${msTokens.access_token}`,
      },
    });

    const [googleData, msData] = await Promise.all([googleResponse.json(), msResponse.json()]);

    return {
      google: googleData,
      microsoft: msData,
    };
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    throw error;
  }
};
```

### Token Properties

The `getConnectionToken()` method returns an object with the following property:

<Property name="access_token" type="string">
  The OAuth2 access token for API calls
</Property>

## Managing Connections via CLI

These commands work on any connection regardless of which option created it:

```bash
# Open the connections page in the Console
tailor-sdk authconnection open

# Authorize (opens browser for OAuth2 flow)
tailor-sdk authconnection authorize --name <connection-name>

# List all connections
tailor-sdk authconnection list

# Revoke a connection's tokens (keeps the connection; re-authorize later)
tailor-sdk authconnection revoke --name <connection-name>

# Delete a connection entirely
tailor-sdk authconnection delete --name <connection-name>
```

To delete a connection managed via SDK config (Option A), remove it from `connections` and redeploy instead of using `authconnection delete` directly — manage each connection through one method only, as described above.

For connections not defined in `defineAuth()`'s `connections`, `authconnection.getConnectionToken()` still accepts any string, so you can read tokens for Console-managed connections the same way — you just lose the type-checked autocompletion.

## Best Practices

### Security Considerations

1. **Client Secrets**: Treat OAuth2 client secrets as passwords. Rotate them regularly.
2. **HTTPS Only**: Always use HTTPS for redirect URIs in production.
3. **Scope Management**: Configure minimal required scopes for your application needs.
4. **Token Handling**: Never log or expose access tokens in your Function code.

### Naming Conventions

Use descriptive names that indicate the provider and environment:

- `google-oauth-prod`
- `ms365-oauth-dev`
- `quickbooks-oauth-staging`

### Environment-Specific Configurations

Since each environment is deployed to its own workspace from the same `tailor.config.ts`, keep a single connection definition and vary the value via a per-environment `.env` file — the same pattern used for any other environment-specific value (see [Multi-Environment Configuration](/sdk/multi-environment)):

```typescript
connections: {
  "google-oauth": {
    type: "oauth2",
    providerUrl: "https://accounts.google.com",
    issuerUrl: "https://accounts.google.com",
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
},
```

```bash
tailor-sdk deploy -w <production-workspace-id> --env-file .env.production
```

## Troubleshooting

### Common Issues

**Invalid Client Error**

- Verify client ID and secret are correct
- Check if the OAuth2 app is enabled/active in the provider's console

**Redirect URI Mismatch**

- Ensure the redirect URI configured in your provider matches exactly with your application

**Scope Errors**

- Verify requested scopes are enabled in your OAuth2 application
- Some providers require admin consent for certain scopes

**Token Expiration**

- Implement refresh token flow in your application
- Monitor token expiration times

**Re-authorization Required After Deploy**

- If `tailor-sdk deploy` warns that a connection needs re-authorization, run `tailor-sdk authconnection authorize --name <connection-name>` again
- This happens when identity-changing fields (`providerUrl`, `issuerUrl`, `clientId`, `type`) are modified

**Function Runtime Errors**

- Ensure the connection name exists and is authorized
- Check that the connection has valid, non-expired tokens
- Verify network connectivity to external APIs

## Next Steps

- [Setting up Auth Connections tutorial](/tutorials/setup-auth/setup-auth-connections) - Step-by-step SDK walkthrough
- [Auth Service SDK reference](/sdk/services/auth#auth-connections) - Full auth connections API reference
- [Runtime API](/sdk/runtime#namespaces) - `@tailor-platform/sdk/runtime` namespaces, including `authconnection`
- [Learn about Function service](/guides/function/overview) - Understand Function runtime capabilities
- [Secret Manager documentation](/guides/secretmanager) - Secure secret storage patterns
- [Auth service overview](/guides/auth/overview) - Complete authentication system
- [Function examples](/guides/function/examples) - More Function integration patterns

## Additional Resources

- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [OpenID Connect Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [Google Identity Platform](https://developers.google.com/identity)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Intuit OAuth 2.0](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
