---
doc_type: guide
preview: true
---

# Integrate Claude and Claude Code with Tailor Platform <PreviewTag />

## Overview

Claude supports [custom connectors using remote MCP](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp), and [Claude Code](https://docs.claude.com/en/docs/claude-code) supports remote [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers via `claude mcp add`.

Tailor Platform exposes a remote MCP server for each application (currently in preview), allowing Claude and Claude Code to execute GraphQL queries and mutations against your application's Dataplane on behalf of an authenticated user.

By registering your Tailor PF app as a remote MCP server in Claude or Claude Code, you can let them read and write your application data through the same OAuth2-authenticated GraphQL API used by your other clients.

## Prerequisites

- A deployed Tailor PF application reachable at `https://{YOUR_APP_SUBDOMAIN}.erp.dev`
- For Claude: a Claude account that can add a custom connector. On Team and Enterprise plans, only an **Owner** or **Primary Owner** can add custom connectors to the organization. On Pro and Max plans, the individual user adds connectors from **Customize > Connectors**.
- For Claude Code: the `claude` CLI installed locally

## 1. Create an OAuth2 Client

Both Claude and Claude Code initiate an OAuth2 authorization code flow against your Tailor PF app, so you need to register an OAuth2 client dedicated to them in your Auth configuration. The two products use different redirect URIs, so you can register them on a single client to support both.

Use the following settings:

| Setting        | Value                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clientType`   | `public` (Claude and Claude Code are public clients and cannot securely store a client secret)                                                              |
| `requireDPoP`  | `false` (Claude's and Claude Code's MCP clients do not support DPoP)                                                                                        |
| `redirectURIs` | `https://claude.ai/api/mcp/auth_callback` for Claude, and `http://localhost:3000/oauth/callback` for Claude Code (the port matches `--callback-port` below) |
| `grantTypes`   | `authorization_code`, `refresh_token`                                                                                                                       |

Add the client to your `defineAuth` configuration:

```typescript
import { defineAuth } from "@tailor-platform/sdk";

export const authConfig = defineAuth("my-auth", {
  oauth2Clients: {
    "claude-connector": {
      description: "OAuth2 client for Claude and Claude Code",
      clientType: "public",
      requireDPoP: false,
      redirectURIs: [
        // For Claude (custom connector)
        "https://claude.ai/api/mcp/auth_callback",
        // For Claude Code (`claude mcp add ... --callback-port 3000`)
        "http://localhost:3000/oauth/callback",
      ],
      grantTypes: ["authorization_code", "refresh_token"],
    },
  },
});
```

Deploy the configuration:

```bash
npm run deploy -- --workspace-id <your-workspace-id>
```

After deployment, look up the issued `CLIENT_ID` with the SDK CLI:

```bash
tailor-sdk oauth2client list
```

```bash
+---------------+-----------------------------------------------------+
| NAME          | claude-connector                                    |
| DESCRIPTION   | OAuth2 client for Claude and Claude Code            |
| GRANT_TYPES   | authorization_code,refresh_token                    |
| REDIRECT_URIS | https://claude.ai/api/mcp/auth_callback,            |
|               | http://localhost:3000/oauth/callback                |
| CLIENT_ID     | <client_id>                                         |
+---------------+-----------------------------------------------------+
```

Keep the `CLIENT_ID` value for the next step.

## 2. Register the Remote MCP Server

Pick the section that matches the product you want to use.

### 2a. Claude (custom connector)

Following [Get started with custom connectors using remote MCP](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp):

1. Open the connectors page in Claude.
   - **Team and Enterprise plans**: an Owner or Primary Owner navigates to **Organization settings > Connectors**.
   - **Pro and Max plans**: navigate to **Customize > Connectors**.
2. Click **+**, then **Add custom connector**.
3. Enter the **remote MCP server URL**: `https://{YOUR_APP_SUBDOMAIN}.erp.dev/mcp` (replace `{YOUR_APP_SUBDOMAIN}` with the subdomain of your deployed Tailor PF application).
4. Click **Advanced settings** and set the **OAuth Client ID** to the `CLIENT_ID` issued for the `claude-connector` OAuth2 client in the previous step. Leave **OAuth Client Secret** empty (the OAuth2 client is a public client and has no secret).
5. Save the connector.

Claude uses the `https://claude.ai/api/mcp/auth_callback` redirect URI registered on the OAuth2 client.

### 2b. Claude Code (`claude mcp add`)

Run the following command to add the remote MCP server to Claude Code:

```bash
claude mcp add --transport http <mcp-name> https://{YOUR_APP_SUBDOMAIN}.erp.dev/mcp \
  --client-id <CLIENT_ID> \
  --callback-port 3000
```

- `<mcp-name>` is a local name for the server (e.g., `my-app`).
- `<CLIENT_ID>` is the `CLIENT_ID` issued for the `claude-connector` OAuth2 client.
- `--callback-port 3000` makes Claude Code use `http://localhost:3000/oauth/callback` as the redirect URI, which must match one of the redirect URIs registered on the OAuth2 client.

## 3. Use the Remote MCP Server

The first time Claude or Claude Code calls a tool on the server, it triggers an OAuth2 authorization code flow against your Tailor PF app. After you sign in and grant access, the client receives an access token and can call MCP tools backed by your application's GraphQL endpoint to run queries and mutations on your behalf.

Because the connection uses the authenticated user's access token, all existing TailorDB type permissions and authorization rules apply to operations executed by Claude or Claude Code.
