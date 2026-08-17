---
doc_type: guide
preview: true
---

# AI Gateway <PreviewTag />

AI Gateway provides a unified, OpenAI-compatible endpoint for accessing a range of large language models through a single API. The platform manages all model credentials, so you don't need to bring your own API keys. Every request is authenticated against your workspace's auth, and each gateway is isolated to its own workspace-scoped endpoint.

## How it works

- **One endpoint, many models.** Send standard OpenAI-style requests (`/v1/chat/completions`, `/v1/responses`, `/v1/embeddings`, …) and choose a model by setting the `model` field. The gateway routes the request to the selected model and handles protocol translation for you.
- **Platform-managed credentials.** All model credentials are managed by the platform — you never handle API keys.
- **Mandatory authentication.** Every request is authenticated against the auth namespace you configure. External clients present an application user token; server-side [functions](#calling-from-a-function) are authenticated by the platform and need no token of their own.
- **Per-workspace isolation.** Each gateway is provisioned with its own URL and its own usage tracking and rate limits.

## Configuration

Define an AI Gateway in your `tailor.config.ts` with [`defineAIGateway()`](/sdk/services/aigateway). At minimum you provide a name and the auth namespace used to authenticate requests:

```typescript {{ title: "tailor.config.ts" }}
import { defineAIGateway, defineConfig } from "@tailor-platform/sdk";

const aiGateway = defineAIGateway("my-aigateway", {
  authNamespace: "default",
});

export default defineConfig({
  name: "my-app",
  aiGateways: [aiGateway],
});
```

After deploying, the gateway is reachable at a workspace-scoped URL of the form:

```
https://{gateway-name}-{workspace-hash}.ai.erp.dev
```

See the [SDK reference](/sdk/services/aigateway) for all options, including CORS configuration and type-safe URL references.

## Supported models

Specify the model with the `model` field in the request body. The following models are available:

<!-- The two model tables on this page are generated. Don't hand-edit anything
     between the BEGIN/END GENERATED markers — changes there are overwritten on
     the next sync. Prose outside the markers is safe to edit. -->

<!-- BEGIN GENERATED: supported-models -->

| Model                    | Type      | Location |
| ------------------------ | --------- | -------- |
| `gemini-3.1-flash-lite`  | Chat      | Global   |
| `gemini-3.5-flash`       | Chat      | Global   |
| `gemini-3.5-flash-lite`  | Chat      | Global   |
| `gemini-3.6-flash`       | Chat      | Global   |
| `gpt-4.1`                | Chat      | Regional |
| `gpt-4o-mini`            | Chat      | Regional |
| `gpt-5`                  | Chat      | Regional |
| `gpt-5-mini`             | Chat      | Regional |
| `gpt-5-nano`             | Chat      | Regional |
| `gpt-5.6-luna`           | Chat      | Regional |
| `gpt-5.6-sol`            | Chat      | Regional |
| `gpt-5.6-terra`          | Chat      | Regional |
| `gemini-embedding-001`   | Embedding | Global   |
| `text-embedding-3-large` | Embedding | Regional |
| `text-embedding-3-small` | Embedding | Regional |

<!-- END GENERATED: supported-models -->

A model's **Type** determines which endpoints it can be used with: **Chat** models are available through `/v1/chat/completions` and `/v1/responses`, and **Embedding** models through `/v1/embeddings`. If the `model` value does not match a supported model exactly, the gateway returns `404 No matching route found`.

### Deprecated models

The following models remain fully available until their retirement date, after which they will stop being served. Please migrate to the suggested replacement before then:

<!-- BEGIN GENERATED: deprecated-models -->

| Model                   | Type | Location | Retires    | Replacement             |
| ----------------------- | ---- | -------- | ---------- | ----------------------- |
| `gemini-2.5-flash`      | Chat | Regional | 2027-01-14 | `gemini-3.5-flash`      |
| `gemini-2.5-flash-lite` | Chat | Global   | 2027-01-14 | `gemini-3.1-flash-lite` |
| `gemini-2.5-pro`        | Chat | Regional | 2027-01-14 | `gemini-3.6-flash`      |

<!-- END GENERATED: deprecated-models -->

Two things to check before migrating:

- **Region**: all suggested replacements are **Global**, while `gemini-2.5-pro` and `gemini-2.5-flash` are **Regional**. If your workload requires in-region inference for data-residency reasons, note that after retirement no Regional Gemini chat models remain — evaluate whether Global routing is acceptable, or use a Regional model from the table above.
- **Thought signatures**: Gemini 3.x models use [thought signatures](https://ai.google.dev/gemini-api/docs/thought-signatures) — to preserve reasoning quality in multi-turn conversations, return each response's thought signatures in your follow-up requests unchanged.

Validate your workflows against the replacement model before switching.

### Model location and region restriction

Each workspace belongs to a home region (currently **Japan** or **US West**). The **Location** column above indicates where a model runs:

- **Regional** — served from within your workspace's home region. The request and its data stay in that region.
- **Global** — routed dynamically to the nearest available region, which may be outside your workspace's home region.

If you need to keep all inference within a specific region — for data-residency or compliance reasons — use only models marked **Regional**.

## Authentication

Every request must include a valid application user token from your workspace's auth as a Bearer token:

```
Authorization: Bearer <application-user-token>
```

The token is resolved against the `authNamespace` configured on the gateway. Requests without a valid token are rejected. DPoP-bound tokens (`Authorization: DPoP <token>`) are also supported.

Calls made from inside your workspace are the exception: server-side [functions](#calling-from-a-function) are authenticated by the platform and send no `Authorization` header at all.

## Calling the gateway

The endpoint is OpenAI-compatible, so you can use any OpenAI-style client or a plain HTTP request.

### With curl

```bash {{ title: "Chat completion" }}
curl https://my-aigateway-{WORKSPACE_HASH}.ai.erp.dev/v1/chat/completions \
  -H "Authorization: Bearer $APP_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "messages": [
      { "role": "user", "content": "Hello!" }
    ]
  }'
```

### With the OpenAI SDK

Point the OpenAI client at your gateway URL and pass the application user token as the API key:

```typescript {{ title: "Using the OpenAI SDK" }}
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://my-aigateway-{WORKSPACE_HASH}.ai.erp.dev/v1",
  apiKey: appUserToken, // application user token
});

const completion = await client.chat.completions.create({
  model: "gemini-2.5-pro",
  messages: [{ role: "user", content: "Hello!" }],
});
```

### Available paths

| Method | Path                   | Purpose               |
| ------ | ---------------------- | --------------------- |
| `POST` | `/v1/chat/completions` | Chat completions      |
| `POST` | `/v1/responses`        | Responses API         |
| `POST` | `/v1/embeddings`       | Embeddings            |
| `GET`  | `/v1/models`           | List available models |

The Responses API (`/v1/responses`) returns its result as an `output` array rather than the `choices[]` array used by chat completions — parse the response accordingly.

## Web search & grounding

Both OpenAI and Gemini models can answer with live, web-grounded information and return source citations. The tool, endpoint, and response shape differ by provider.

### OpenAI

Use the Responses API (`/v1/responses`) with the `web_search` tool:

```bash {{ title: "OpenAI web search" }}
curl https://my-aigateway-{WORKSPACE_HASH}.ai.erp.dev/v1/responses \
  -H "Authorization: Bearer $APP_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "input": "Who won the most recent FIFA World Cup? Include sources.",
    "tools": [{ "type": "web_search" }]
  }'
```

The `output` array holds one or more `web_search_call` items (the searches performed), followed by a `message` whose `output_text` carries the answer and whose `annotations` cite the sources:

```json
{
  "output": [
    { "type": "web_search_call", "status": "completed" },
    {
      "type": "message",
      "content": [
        {
          "type": "output_text",
          "text": "…the answer…",
          "annotations": [
            { "type": "url_citation", "url": "https://example.com/post", "title": "Example" }
          ]
        }
      ]
    }
  ]
}
```

:::tip
Under the default `tool_choice: "auto"`, the model only searches when it judges a query needs it — for a fact it already knows it may answer directly, leaving `annotations` empty. To force a search (and citations), set `tool_choice: "required"`. The older `web_search_preview` tool behaves the same way; prefer the GA `web_search` tool.
:::

### Gemini

Gemini grounding uses the `google_search` tool on `/v1/chat/completions` (not the Responses API). Call it **without streaming** — the grounding data is only present on the final response body, not on streamed SSE chunks:

```bash {{ title: "Gemini google_search" }}
curl https://my-aigateway-{WORKSPACE_HASH}.ai.erp.dev/v1/chat/completions \
  -H "Authorization: Bearer $APP_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{ "role": "user", "content": "Who won the most recent FIFA World Cup? Include sources." }],
    "tools": [{ "type": "google_search" }]
  }'
```

Grounding appears on `choices[].message.grounding_metadata` — the search queries the model issued and the sources it used:

```json
{
  "choices": [
    {
      "message": {
        "content": "…the answer…",
        "grounding_metadata": {
          "webSearchQueries": ["most recent FIFA World Cup winner"],
          "groundingChunks": [
            {
              "web": {
                "uri": "https://example.com/post",
                "title": "Example",
                "domain": "example.com"
              }
            }
          ]
        }
      }
    }
  ]
}
```

:::warning Web search sends data outside your region and compliance boundary
When you enable web search (`web_search` or `google_search`), your query and relevant request context are sent to an external web search provider — Bing for OpenAI, Google Search for Gemini — to fetch results. That data leaves your workspace's home region and falls outside its data-residency and compliance boundary (see [Model location and region restriction](#model-location-and-region-restriction)). Only enable web search for workspaces where that is acceptable.
:::

## Calling from a Function

Server-side [functions](/guides/function/overview) — resolvers, executor functions, job functions, workflow jobs, and auth hook handlers — can call the gateway with plain `fetch`, and **you do not set an `Authorization` header**. The function runtime recognizes requests addressed to your own workspace's AI Gateway and attaches the execution's identity for you, so no token ever has to be minted, stored, or passed through your code.

:::tip Prefer an asynchronous execution site
LLM inference is slow — a single completion routinely takes tens of seconds, and longer for reasoning-heavy models, long outputs, or [web search](#web-search-grounding). Synchronous execution sites cannot absorb that: resolvers and Function service executions are [capped at 60 seconds](/reference/platform/timeouts), as is the API gateway in front of them, so a slow completion fails the whole operation.

**Call the gateway from a [job function](/guides/executor/job-function-operation) or a [workflow](/sdk/services/workflow) job**, which run asynchronously with a much higher execution ceiling, and have the caller pick the result up afterwards — read it from the record the job writes, or subscribe to the executor or workflow completion event.

Calling from a resolver or an [auth hook](/guides/auth/hook) works but is discouraged. Both make a user wait on inference: a resolver holds the GraphQL request open, and a `beforeLogin` hook adds the latency to **every** login and fails the login outright if the call errors. Reserve them for cases where you know the response is small and fast, and always set a timeout you control.
:::

Resolve the gateway URL with [`aigateway.get()`](/sdk/services/aigateway#runtime-usage) rather than hardcoding it — the name is type-checked against the gateways declared in `aiGateways`:

```typescript {{ title: "executors/summarize-order.ts" }}
import { createExecutor, recordCreatedTrigger } from "@tailor-platform/sdk";
import { aigateway } from "@tailor-platform/sdk/runtime";
import { getDB } from "../generated/tailordb";
import { order } from "../tailordb/order";

export default createExecutor({
  name: "summarize-order",
  trigger: recordCreatedTrigger({ type: order }),
  operation: {
    // Asynchronous, so a slow completion can't time out a caller.
    kind: "jobFunction",
    // Runs the function as this machine user; its auth namespace must be the
    // one the gateway is configured with.
    invoker: "ai-machine-user",
    body: async ({ newRecord }) => {
      const { url } = await aigateway.get("my-aigateway");

      const res = await fetch(`${url}/v1/chat/completions`, {
        method: "POST",
        // No Authorization header — the runtime authenticates the call.
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-5",
          messages: [{ role: "user", content: `Summarize this order: ${newRecord.notes}` }],
        }),
      });

      const body = await res.json();

      // Persist the result rather than returning it — nothing is waiting.
      await getDB("tailordb")
        .updateTable("Order")
        .set({ summary: body.choices[0].message.content })
        .where("id", "=", newRecord.id)
        .execute();
    },
  },
});
```

Only `https` requests to your own workspace's gateway hostname are treated this way. Every other `fetch` — a third-party API you authenticate with your own key, for example — is left completely untouched.

:::info Not available in inline expressions
Short inline expressions — [TailorDB hooks](/guides/tailordb/hooks), [validations](/guides/tailordb/validations), and default values, plus executor `variables` — are evaluated in a sandbox with no outbound network access at all, so they cannot reach the gateway (or any other host). Move the call into an executor function, job function, resolver, workflow job, or auth hook handler.
:::

### Which identity the request runs as

The gateway sees the identity the function execution itself runs as, which is what the `invoker` option controls:

| Where the function runs                 | Identity attached to the gateway request                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Resolver](/sdk/services/resolver)      | The resolver's `invoker` machine user if it declares one; otherwise the GraphQL caller.                                                                 |
| Executor `function` / `jobFunction`     | The operation's `invoker` machine user if it declares one; otherwise the user whose action raised the trigger event; otherwise anonymous.               |
| [Workflow](/sdk/services/workflow) jobs | The `invoker` passed when the workflow was started — via `workflow.start(args, { invoker })` or the executor `workflow` operation; otherwise anonymous. |
| [Auth hook](/guides/auth/hook) handler  | The hook's `invoker` machine user, which is always required.                                                                                            |

:::warning The invoker's auth namespace must match the gateway's
The gateway accepts the request only when the identity's auth namespace is the same one the gateway was configured with in `authNamespace`. A machine user from a different auth namespace is rejected with `401 Unauthorized`.

Anonymous executions carry no auth namespace at all, so they are always rejected. In practice this means a schedule-triggered executor, or a workflow started without an invoker, **must** declare an `invoker` to reach the gateway — there is no ambient identity to fall back on.
:::

### Authenticating explicitly instead

If you set an `Authorization` header yourself, the runtime skips its own authentication entirely and sends the request as you wrote it — the [external path](#authentication) with an application user token. Use this when you deliberately want the request to run as a specific end user whose token you already hold.

The internal header the runtime uses is platform-managed: any value your code sets for it is stripped before the request leaves the runtime, so a function cannot pick its own identity by forging one.

## Streaming

Streaming responses (`"stream": true`) are supported across all layers of the gateway. Long-running streams — such as high-effort reasoning — are kept alive by generous upstream timeouts that allow responses to stream for several minutes. The exact limit is managed by the platform and may change; don't rely on a specific value.

Note that this budget is the gateway's own. A stream consumed inside a function is still bounded by that execution's [timeout](/reference/platform/timeouts) — a stream the gateway would happily hold open for minutes will still be cut off at 60 seconds in a resolver. This is another reason to prefer an [asynchronous execution site](#calling-from-a-function).

## CORS

To call the gateway directly from a browser, configure allowed origins with the `cors` option on `defineAIGateway()`. Without it, browsers block cross-origin requests. See the [SDK reference](/sdk/services/aigateway#cors) for the accepted origin formats.

## Usage tracking and rate limiting

Token usage is tracked per workspace, including prompt-caching metrics where the model supports it. Each gateway is rate-limited per workspace. Both are managed by the platform.
