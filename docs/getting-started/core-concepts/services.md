# Services

Tailor Platform offers several core services to help you build applications. Each service is designed to handle specific functionality and can be composed together to create powerful applications.

## Core Services

### TailorDB

A flexible database service that provides:

- **Type-safe schema definition** using the SDK
- **Auto-generated GraphQL API** for CRUD operations
- **Relationships** between data types
- **Hooks** for custom logic
- **Permission-based access control**

[Learn more about TailorDB →](/guides/tailordb/overview)

### Auth

Authentication and authorization service that provides:

- **User management** and authentication
- **Identity Provider (IdP) integration** (Okta, Entra ID, Google Workspace, Auth0)
- **Built-in IdP** for quick setup
- **Machine users** for service-to-service communication

[Learn more about Auth →](/guides/auth/overview)

### Pipeline

Custom GraphQL resolver service for business logic:

- **Query resolvers** for custom read operations
- **Mutation resolvers** for custom write operations
- **Type-safe input/output** definitions
- **Access to TailorDB** via query builder

[Learn more about Pipeline →](/guides/resolver)

### Executor

Event-driven automation service:

- **Event-based triggers** on database changes
- **Schedule-based triggers** for cron jobs
- **Webhook triggers** for external events
- **Multiple operation types** (GraphQL, Webhook, Function)

[Learn more about Executor →](/guides/executor/overview)

### Function

Serverless JavaScript runtime for custom logic:

- **Custom business logic** in JavaScript
- **HTTP requests** to external services
- **TailorDB access** for data operations

[Learn more about Function →](/guides/function/overview)

### Workflow

Job orchestration service (Preview):

- **Multi-step workflows**
- **Conditional branching**
- **Retry and error handling**

[Learn more about Workflow →](/guides/workflow/)

### Secret Manager

Secure secret storage:

- **API keys and tokens**
- **Connection strings**
- **Environment-specific secrets**

[Learn more about Secret Manager →](/guides/secretmanager)

## Next Steps

- [Quickstart](/getting-started/quickstart) - Build your first application
- [TailorDB](/guides/tailordb/overview) - Start with database setup
