---
tabs:
  api-usage:
    - label: curl
      content: |
        You can interact with Tailor Platform APIs using curl by making HTTP requests to the API endpoints.

        See [Authentication](#authentication) for details on obtaining an access token.

        Once authenticated, you can proceed with API requests:

        **Creating a Workspace**

        ```bash
        curl -X POST "https://api.tailor.tech/tailor.v1.OperatorService/CreateWorkspace" \
          -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "workspace_name": "my-workspace",
            "workspace_region": "us-west",
            "organization_id": "org-123",
            "delete_protection": true
          }'
        ```
    - label: Buf SDKs
      content: |
        Using Buf SDKs is simple - just install the SDK for your language directly from our Buf registry.

        **Go SDK**

        Install the ConnectRPC Go SDK:

        ```bash
        go get buf.build/gen/go/tailor-inc/tailor/connectrpc/go
        ```

        See the full SDK documentation at: https://buf.build/tailor-inc/tailor/sdks/main:connectrpc/go

        **Node.js SDK**

        Install the ConnectRPC Node.js SDK:

        ```bash
        npm install @buf/tailor-inc_tailor.connectrpc_es
        ```

        **Python SDK**

        Install the ConnectRPC Python SDK:

        ```bash
        pip install buf-tailor-inc-tailor-connectrpc
        ```

        For other languages and detailed usage examples, visit our [Buf registry](https://buf.build/tailor-inc/tailor/sdks).
---

# API References

The Tailor Platform exposes its functionality through APIs defined using Protocol Buffers. Using ConnectRPC, we support both gRPC and HTTP protocols. This guide shows you how to interact with these APIs using different approaches.

## Overview

All platform services are exposed through the `OperatorService`, a unified gRPC API for managing workspaces, applications, and platform components. The .proto files defining these services are available in our [GitHub repository](https://github.com/tailor-inc/proto).

## Using the APIs

:::tabs api-usage
:::

## Authentication

All API calls require authentication using Bearer tokens. Use tailor to authenticate:

```bash
# Login to Tailor Platform
tailor login

# Create a personal access token for API authentication
tailor user pat create <token-name>
```

See the [Auth Guide](/guides/auth/overview) for detailed authentication setup.

## Common Operations

### Workspace Management

- `CreateWorkspace` - Create a new workspace
- `GetWorkspace` - Retrieve workspace details
- `ListWorkspaces` - List all accessible workspaces
- `UpdateWorkspace` - Modify workspace settings
- `DeleteWorkspace` - Remove a workspace

### Application Services

- `CreateApplication` - Deploy a new application
- `CreateTailorDBService` - Set up database services
- `CreatePipelineService` - Configure data processing
- `CreateAuthService` - Enable authentication
- `CreateExecutorService` - Set up job execution

## Error Handling

All APIs return standard gRPC status codes. Common error responses include:

- `UNAUTHENTICATED` (16) - Invalid or missing authentication
- `PERMISSION_DENIED` (7) - Insufficient permissions
- `NOT_FOUND` (5) - Resource does not exist
- `ALREADY_EXISTS` (6) - Resource already exists
- `INVALID_ARGUMENT` (3) - Invalid request parameters

## Related Documentation

For implementation details and usage examples, refer to:

- [TailorDB Guide](/guides/tailordb/overview)
- [Pipeline Guide](/guides/resolver)
- [Auth Guide](/guides/auth/overview)
- [Executor Guide](/guides/executor/overview)
- [Function Guide](/guides/function/overview)
