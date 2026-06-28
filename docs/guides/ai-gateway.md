---
doc_type: guide
---

# AI Gateway

AI Gateway provides a unified, OpenAI-compatible endpoint for accessing a range of large language models through a single API. The platform manages all model credentials, so you don't need to bring your own API keys. Every request is authenticated against your workspace's auth, and each gateway is isolated to its own workspace-scoped endpoint.

## How it works

- **One endpoint, many models.** Send standard OpenAI-style requests (`/v1/chat/completions`, `/v1/responses`, `/v1/embeddings`, …) and choose a model by setting the `model` field. The gateway routes the request to the selected model and handles protocol translation for you.
- **Platform-managed credentials.** All model credentials are managed by the platform — you never handle API keys.
- **Mandatory authentication.** Every request must carry a valid application user token, resolved against the auth namespace you configure.
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

| Model | Type | Location |
| --- | --- | --- |
| `gpt-5` | Chat | Regional |
| `gpt-5-mini` | Chat | Regional |
| `gpt-5-nano` | Chat | Regional |
| `gpt-4.1` | Chat | Regional |
| `gpt-4o-mini` | Chat | Regional |
| `gemini-2.5-pro` | Chat | Regional |
| `gemini-2.5-flash` | Chat | Regional |
| `gemini-2.5-flash-lite` | Chat | Global |
| `gemini-3.5-flash` | Chat | Global |
| `text-embedding-3-large` | Embedding | Regional |
| `text-embedding-3-small` | Embedding | Regional |
| `gemini-embedding-001` | Embedding | Global |

A model's **Type** determines which endpoints it can be used with: **Chat** models are available through `/v1/chat/completions` and `/v1/responses`, and **Embedding** models through `/v1/embeddings`. If the `model` value does not match a supported model exactly, the gateway returns `404 No matching route found`.

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

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/chat/completions` | Chat completions |
| `POST` | `/v1/responses` | Responses API |
| `POST` | `/v1/embeddings` | Embeddings |
| `GET` | `/v1/models` | List available models |

The Responses API (`/v1/responses`) returns its result as an `output` array rather than the `choices[]` array used by chat completions — parse the response accordingly.

## Calling from a Function

Server-side [functions](/guides/function/overview) can call the gateway over HTTP with `fetch`. See [Sending requests from Function service](/guides/function/sending-request) for the general pattern of making outbound HTTP requests from a function.

## Streaming

Streaming responses (`"stream": true`) are supported across all layers of the gateway. Long-running streams — such as high-effort reasoning — are kept alive by generous upstream timeouts that allow responses to stream for several minutes. The exact limit is managed by the platform and may change; don't rely on a specific value.

## CORS

To call the gateway directly from a browser, configure allowed origins with the `cors` option on `defineAIGateway()`. Without it, browsers block cross-origin requests. See the [SDK reference](/sdk/services/aigateway#cors) for the accepted origin formats.

## Usage tracking and rate limiting

Token usage is tracked per workspace, including prompt-caching metrics where the model supports it. Each gateway is rate-limited per workspace. Both are managed by the platform.
