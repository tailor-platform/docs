---
doc_type: guide
---

# Give AI Assistants the Tailor Platform Docs with MCP

## Overview

Tailor runs a public [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server at `https://mcp.tailor.tech/`. Connect it to Claude, ChatGPT, Claude Code, Cursor, VS Code, Codex, or any other MCP client, and the assistant can search and read this documentation while it helps you build on Tailor Platform.

<McpInstallButtons />

The server is read-only, needs no account or token, and only serves the content of `docs.tailor.tech`. It never sees your application data. To let an assistant query or change data in one of your applications, use the per-application server described in [Integrate Claude and Claude Code with Tailor Platform](/guides/integration/claude). The two work side by side.

## Connect a client

Every client below needs the same two values:

| Setting   | Value                      |
| --------- | -------------------------- |
| URL       | `https://mcp.tailor.tech/` |
| Transport | Streamable HTTP            |
| Auth      | None                       |

The examples name the server `tailor-mcp`. Pick any name you like.

### Claude

Search for **Tailor** in the connectors directory and add it. On Team and Enterprise plans an Owner enables it under **Organization settings > Connectors**. On Pro and Max plans open **Customize > Connectors**.

If the directory is not available to you, choose **Add custom connector** and enter `https://mcp.tailor.tech/` as the remote MCP server URL. Leave the OAuth fields empty.

### ChatGPT

Open **Settings > Apps**, search the directory for **Tailor**, and add it. ChatGPT then calls the server whenever a conversation touches Tailor Platform.

On Business, Enterprise, and Edu workspaces an admin enables it first under **Workspace settings > Apps > Directory**. Members then add it from their own **Settings > Apps**.

### Claude Code

Add it for your user:

```bash
claude mcp add --transport http tailor-mcp https://mcp.tailor.tech/
```

Or add it to the project so everyone who clones the repository gets it. This writes `.mcp.json` at the project root:

```bash
claude mcp add --transport http --scope project tailor-mcp https://mcp.tailor.tech/
```

```json
{
  "mcpServers": {
    "tailor-mcp": {
      "type": "http",
      "url": "https://mcp.tailor.tech/"
    }
  }
}
```

### Cursor

Click **Add to Cursor** above, or create `.cursor/mcp.json` in your project (or `~/.cursor/mcp.json` for all projects):

```json
{
  "mcpServers": {
    "tailor-mcp": {
      "url": "https://mcp.tailor.tech/"
    }
  }
}
```

### VS Code

Click **Add to VS Code** above, or create `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "tailor-mcp": {
      "type": "http",
      "url": "https://mcp.tailor.tech/"
    }
  }
}
```

### Codex

```bash
codex mcp add tailor-mcp --url https://mcp.tailor.tech/
```

This is the same as adding the following to `~/.codex/config.toml`:

```toml
[mcp_servers.tailor-mcp]
url = "https://mcp.tailor.tech/"
```

### Other clients

Any client that supports remote MCP servers over Streamable HTTP can connect with the URL alone. No headers are required.

## What the assistant can do

The server exposes three tools. Assistants pick them on their own; you do not have to name them.

| Tool               | What it does                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `search_knowledge` | Full-text search over the documentation. Returns matching pages with an excerpt and an `id`.                   |
| `list_knowledge`   | The table of contents: every page with its `id`, title, section, and summary.                                  |
| `fetch_knowledge`  | The Markdown of one page by `id`. Long pages come back as an outline first; pass a `section` to read one part. |

Every result starts with the page URL so the assistant can cite it.

Prompts that work well once the server is connected:

- "How do I define a TailorDB type with a relationship to another type?"
- "What are the redirect URI requirements for a public OAuth2 client in Tailor Auth?"
- "Show me how AppShell file-based routing maps directories to pages."
- "Compare Executor triggers and StateFlow for reacting to record changes."

## Tell your coding agent to use it

Coding agents follow the instructions in your project. Add a line such as the following to `AGENTS.md` or `CLAUDE.md` so the agent reaches for the docs instead of guessing:

```markdown
For Tailor Platform questions (SDK, TailorDB, AppShell, Auth, Executor, StateFlow),
use the `tailor-mcp` MCP tools before answering. If they are not available, ask the
user to run `claude mcp add --transport http tailor-mcp https://mcp.tailor.tech/`.
```

## Notes

- The content is the same as the [Markdown export](https://docs.tailor.tech/llms.txt) of this site and updates when the docs do.
- The server is hosted in `asia-northeast1` and rate limited. It is meant for interactive assistants, not for bulk export; use the Markdown export for that.
- Tool names are stable, so you can refer to them in agent instructions.
