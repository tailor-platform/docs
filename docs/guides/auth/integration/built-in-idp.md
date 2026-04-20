---
doc_type: guide
preview: true
---

# Built-in IdP <PreviewTag />

Managing multiple identity providers can be a hassle. The Built-in IdP offers a native solution within the Tailor Platform, eliminating the need for external providers and seamlessly integrating with your Auth service. In this guide, you’ll learn how to set it up, configure it, and integrate it with your applications in just a few steps.

**Consistent User Experience**: The usability of authentication and authorization remains unchanged whether using Built-in IdP or external identity providers. Users will experience the same authentication flows and access controls regardless of your IdP choice.

## Prerequisites

Before setting up Built-in IdP, ensure you have:

- A Tailor Platform workspace
- Auth service configured in your application

## Configuration

Built-in IdP requires several resources working together to provide complete authentication functionality. The setup involves creating an IdP service, client configuration, secret management, and Auth service integration.

All Built-in IdP user management operations are denied by default. This applies to both GraphQL operations and access via [`tailor.idp.Client`](/guides/function/managing-idp-users) in Functions.

Access must be explicitly granted by defining per-operation permission policies in the `permission` block. This follows the same policy-based model as [TailorDB Permission](/guides/tailordb/permission), though the supported operators and operands differ between the two.

```typescript
// tailor.config.ts
import { defineConfig, defineIdp, defineAuth } from "@tailor-platform/sdk";
import { user } from "./tailordb/user"; // Your TailorDB user type

// 1. Define the IdP service with client and permission
const idp = defineIdp("builtin-idp", {
  clients: ["main-client"], // Automatically creates client credentials
  permission: {
    create: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    read: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    update: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    delete: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    sendPasswordResetEmail: [
      { conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true },
    ],
  },
  userAuthPolicy: {
    useNonEmailIdentifier: false,
    allowSelfPasswordReset: true,
  },
  emailConfig: {
    fromName: "My App Support",
    passwordResetSubject: "Reset your My App password",
  },
});

// 2. Configure Auth service to use the Built-in IdP
const auth = defineAuth("my-auth", {
  userProfile: {
    type: user,
    usernameField: "email",
    attributes: { role: true },
  },
  // Connects Auth to IdP - secrets are managed automatically
  idProvider: idp.provider("builtin-idp-provider", "main-client"),
});

// 3. Export the complete configuration
export default defineConfig({
  idp: [idp],
  auth,
});
```

### Permission Configuration

The `permission` block controls who can perform each IdP user management operation. Each operation has an independent list of policies.

:::warning Important
If `permission` is not configured, all IdP user management operations (create, read, update, delete, send password reset email) will be denied. This includes both GraphQL operations and access via `tailor.idp.Client` in Functions. OIDC-based login is not affected by permission settings.
:::

#### Operations

| Operation | Description | Available operands |
| --- | --- | --- |
| `create` | Controls who can create IdP users | `user`, `idpUser`, literal values |
| `read` | Controls who can read IdP users | `user`, `idpUser`, literal values |
| `update` | Controls who can update IdP users | `user`, `oldIdpUser`, `newIdpUser`, literal values |
| `delete` | Controls who can delete IdP users | `user`, `idpUser`, literal values |
| `sendPasswordResetEmail` | Controls who can send password reset emails | `user`, `idpUser`, literal values |

#### Policy Evaluation

Policies are evaluated sequentially in array order:

1. If the policy list is empty (or `permission` is not configured for the operation), the operation is **denied** (implicit deny)
2. For each policy, all conditions are checked (AND). If all conditions are satisfied, the policy matches
3. If a matching policy has `permit: false`, the operation is **immediately denied** (short-circuit). No further policies are evaluated
4. If a matching policy has `permit: true`, it is recorded as allowed, but evaluation continues to check for subsequent deny policies
5. After all policies are evaluated, the operation is allowed only if at least one allow policy matched. Otherwise it is denied

Because deny short-circuits, **deny always takes precedence over allow regardless of order**.

#### Operands

- `{ user: "field" }` - Authenticated user's attribute from JWT claims (e.g., `"_id"`, `"_loggedIn"`, or custom attributes from Auth's AttributeMap)
- `{ idpUser: "field" }` - Target IdP user's field (for create/read/delete/sendPasswordResetEmail). Available fields: `"id"`, `"name"`, `"disabled"`
- `{ oldIdpUser: "field" }` - IdP user field before update (for update only). Available fields: `"id"`, `"name"`, `"disabled"`
- `{ newIdpUser: "field" }` - IdP user field after update (for update only). Available fields: `"id"`, `"name"`, `"disabled"`
- Literal values: `string`, `boolean`, `string[]`, `boolean[]`

#### Operators

`"="`, `"!="`, `"in"`, `"not in"`

#### Examples

**Role-based access control:**

```typescript
const idp = defineIdp("builtin-idp", {
  clients: ["main-client"],
  permission: {
    create: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    read: [{ conditions: [[{ user: "_loggedIn" }, "=", true]], permit: true }],
    update: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    delete: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    sendPasswordResetEmail: [
      { conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true },
    ],
  },
});
```

**Self-record access with admin override:**

This example assumes that `usernameField` is `"email"` (i.e., the IdP user's `name` field contains an email address), and that `email` is mapped in the Auth service's `attributes` so that `{ user: "email" }` is available in permission conditions:

```typescript
const auth = defineAuth("my-auth", {
  userProfile: {
    type: user,
    usernameField: "email",
    attributes: { role: true, email: true }, // "email" must be included
  },
  idProvider: idp.provider("builtin-idp-provider", "main-client"),
});
```

```typescript
const idp = defineIdp("builtin-idp", {
  clients: ["main-client"],
  permission: {
    create: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    read: [
      // Admins can read all users
      { conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true },
      // Users can read their own record
      {
        conditions: [[{ user: "email" }, "=", { idpUser: "name" }]],
        permit: true,
      },
    ],
    update: [
      { conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true },
      {
        conditions: [
          [{ user: "email" }, "=", { oldIdpUser: "name" }],
          [{ user: "email" }, "=", { newIdpUser: "name" }],
        ],
        permit: true,
      },
    ],
    delete: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    sendPasswordResetEmail: [
      { conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true },
    ],
  },
});
```

**Deny creating disabled users:**

```typescript
const idp = defineIdp("builtin-idp", {
  clients: ["main-client"],
  permission: {
    create: [
      // Deny takes precedence: prevent creating disabled users
      {
        conditions: [[{ idpUser: "disabled" }, "=", true]],
        permit: false,
      },
      // Allow admins to create users
      { conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true },
    ],
    // ... other operations
  },
});
```

### Architecture Overview

The Built-in IdP integration involves three main components working together:

1. **IdP Service**: Provides the identity provider functionality and user authentication
2. **Auth Service**: Handles authentication flows and user session management
3. **Application**: Orchestrates the services and exposes the unified GraphQL API

### Integration Flow

**Step 1: IdP Service Setup**
The `tailor_idp` resource creates the identity provider service that will handle user authentication. This service:

- Manages user credentials and authentication
- Provides OIDC endpoints for authentication flows
- Generates client credentials for secure communication

**Step 2: Auth Service Configuration**
The `tailor_auth_idp_config` resource connects your Auth service to the Built-in IdP:

- Configures OIDC settings to communicate with the IdP service
- Maps user claims to application user profiles
- Handles token validation and user session management

**Step 3: Application Integration**
When you register both IdP and Auth services as subgraphs in your application, they become part of your unified GraphQL schema:

- IdP subgraph provides user management operations (`_users`, `_createUser`, etc.)
- Auth subgraph provides authentication and authorization functionality
- Application orchestrates both services through a single GraphQL endpoint

### Service Communication

The services communicate through secure internal channels:

```
User Request → Application → Auth Service → IdP Service
                    ↓              ↓           ↓
              GraphQL API → Token Validation → User Authentication
```

**Authentication Flow:**

1. User attempts to authenticate through your application
2. Auth service redirects to Built-in IdP OIDC endpoints
3. IdP service validates credentials and issues tokens
4. Auth service validates tokens and creates user sessions
5. Application provides authenticated access to protected resources

### Authentication Policy Configuration

The `user_auth_policy` block allows you to configure how users authenticate with the Built-in IdP:

- **Email-only authentication** (default): When `use_non_email_identifier` is `false` or omitted, users can only authenticate using email addresses
- **Username-based authentication**: When `use_non_email_identifier` is `true`, users can authenticate using identifiers other than email addresses (such as usernames)
- **Self-service password reset**: When `allow_self_password_reset` is `true`, a "Forgot Password?" link is displayed on the sign-in screen, allowing users to reset their own password. This option is disabled by default.
- **Google OAuth**: When `allow_google_oauth` is `true`, a "Sign in with Google" button is displayed on the sign-in screen, allowing users to authenticate using their Google account. Requires `allowed_email_domains` to be set. See [Google OAuth](#google-oauth) for details.
- **Allowed email domains**: When `allowed_email_domains` is set, only users with email addresses from the specified domains can sign in or be created. See [Allowed Email Domains](#allowed-email-domains) for details.
- **Microsoft OAuth**: When `allow_microsoft_oauth` is `true`, a "Sign in with Microsoft" button is displayed on the sign-in screen, allowing users to authenticate using their Microsoft account. Requires `allowed_email_domains` and `disable_password_auth` to be set. See [Microsoft OAuth](#microsoft-oauth) for details.
- **Disable password authentication**: When `disable_password_auth` is `true`, password-based sign-in and password reset are disabled. Google OAuth or Microsoft OAuth becomes the sole authentication method. See [Disable Password Authentication](#disable-password-authentication) for details.

This flexibility allows you to choose the authentication method that best fits your application's requirements.

### Password Policy Configuration

The Built-in IdP allows you to enforce password requirements to enhance security. You can configure password policies within the `user_auth_policy` block to require specific character types and set length constraints.

**Available Password Policy Options:**

- **`password_require_uppercase`** (boolean) - Requires at least one uppercase letter (A-Z) in the password. Defaults to `false`.

- **`password_require_lowercase`** (boolean) - Requires at least one lowercase letter (a-z) in the password. Defaults to `false`.

- **`password_require_numeric`** (boolean) - Requires at least one numeric digit (0-9) in the password. Defaults to `false`.

- **`password_require_non_alphanumeric`** (boolean) - Requires at least one special character (e.g., !@#$%^&\*) in the password. Defaults to `false`.

- **`password_min_length`** (integer) - Minimum password length. Valid range is 6-30. Defaults to `6`.

- **`password_max_length`** (integer) - Maximum password length. Valid range is 6-4096. Defaults to `4096`.

**Example Configuration:**

```typescript
import { defineIdp } from "@tailor-platform/sdk";

export const builtinIdp = defineIdp("builtin-idp", {
  clients: ["main-client"],
  permission: {
    create: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    read: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    update: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    delete: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    sendPasswordResetEmail: [
      { conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true },
    ],
  },
  userAuthPolicy: {
    useNonEmailIdentifier: false,
    allowSelfPasswordReset: true,
    // Password policy settings
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumeric: true,
    passwordRequireNonAlphanumeric: true,
    passwordMinLength: 8,
    passwordMaxLength: 128,
  },
});
```

:::warning Important
When a password policy is updated, existing users whose passwords do not meet the new requirements will be unable to log in until they update their passwords. They will be prompted to reset their password upon their next sign-in attempt.
:::

### Google OAuth

The Built-in IdP supports "Sign in with Google", allowing users to authenticate using their Google accounts. When enabled, a Google Sign-In button is displayed on the sign-in screen alongside the standard email/password form.

**How it works:**

1. User clicks the "Sign in with Google" button on the sign-in screen
2. Google authenticates the user and returns a verified ID token
3. The Built-in IdP verifies the token and checks the user's email
4. If the user does not yet exist, a new IdP user is automatically created using the Google account's email address (without a password)
5. The user is signed in and redirected to the application

:::tip
Users created via Google OAuth do not have a password set. They can only sign in using Google. To enable password-based login for these users, use the \_sendPasswordResetEmail mutation to set an initial password.
:::

:::warning
`allow_google_oauth`, `allow_microsoft_oauth`, `allowed_email_domains`, and `disable_password_auth` are only available via the Terraform provider. These settings are not currently supported in CUE configurations.
:::

To enable Google OAuth, set `allow_google_oauth` to `true` and specify `allowed_email_domains` in the `user_auth_policy` block:

```typescript
import { defineIdp } from "@tailor-platform/sdk";

export const builtinIdp = defineIdp("builtin-idp", {
  clients: ["main-client"],
  permission: {
    create: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    read: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    update: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    delete: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    sendPasswordResetEmail: [
      { conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true },
    ],
  },
  userAuthPolicy: {
    allowGoogleOauth: true,
    allowedEmailDomains: ["example.com"],
  },
});
```

:::tip
allow_google_oauth requires allowed_email_domains to be set. This ensures that only users from specified email domains can authenticate via Google OAuth.
:::

:::warning
`allow_google_oauth` cannot be enabled when `use_non_email_identifier` is `true`. Google OAuth requires email-based identifiers because Google accounts are identified by email addresses.
:::

### Microsoft OAuth

The Built-in IdP supports "Sign in with Microsoft", allowing users to authenticate using their Microsoft accounts via Microsoft Entra ID. When enabled, a Microsoft Sign-In button is displayed on the sign-in screen.

**How it works:**

1. User clicks the "Sign in with Microsoft" button on the sign-in screen
2. Microsoft authenticates the user and returns a verified ID token
3. The Built-in IdP verifies the token and checks the user's identity
4. If the user does not yet exist, a new IdP user is automatically created using the Microsoft account's preferred username (UPN) (without a password)
5. The user is signed in and redirected to the application

:::tip
Users created via Microsoft OAuth do not have a password set. They can only sign in using Microsoft.
:::


To enable Microsoft OAuth, set `allowMicrosoftOauth` to `true`, specify `allowedEmailDomains`, and set `disablePasswordAuth` to `true` in the `userAuthPolicy` block:

```typescript
import { defineIdp } from "@tailor-platform/sdk";

export const builtinIdp = defineIdp("builtin-idp", {
  clients: ["main-client"],
  permission: {
    create: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    read: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    update: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    delete: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    sendPasswordResetEmail: [
      { conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true },
    ],
  },
  userAuthPolicy: {
    allowMicrosoftOauth: true,
    allowedEmailDomains: ["example.com"],
    disablePasswordAuth: true,
  },
});
```

:::tip
`allowMicrosoftOauth` requires both `allowedEmailDomains` and `disablePasswordAuth` to be set. This ensures that only users from specified email domains can authenticate, and that Microsoft OAuth is the sole authentication method.
:::

:::warning
`allowMicrosoftOauth` cannot be enabled when `useNonEmailIdentifier` is `true`. Microsoft OAuth requires email-based identifiers because Microsoft accounts are identified by their preferred username (UPN).
:::

### Allowed Email Domains

You can restrict which email domains are allowed to sign in or be created in the Built-in IdP by setting `allowed_email_domains`. When configured, only users whose email addresses belong to one of the specified domains can authenticate or be registered. This applies to both standard email/password sign-in and Google OAuth.

**Configuration:**

- `allowed_email_domains` (list of strings) - A list of allowed email domains (e.g., `["example.com", "corp.example.com"]`). An empty list (default) means all domains are allowed. Maximum 100 domains.

**Example Configuration:**

```typescript
import { defineIdp } from "@tailor-platform/sdk";

export const builtinIdp = defineIdp("builtin-idp", {
  clients: ["main-client"],
  permission: {
    create: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    read: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    update: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    delete: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    sendPasswordResetEmail: [
      { conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true },
    ],
  },
  userAuthPolicy: {
    allowGoogleOauth: true,
    allowedEmailDomains: ["example.com", "corp.example.com"],
  },
});
```

:::warning
`allowed_email_domains` cannot be set when `use_non_email_identifier` is `true`, as email domain validation requires email-based identifiers.
:::

### Disable Password Authentication

You can disable password-based authentication entirely by setting `disable_password_auth` to `true`. When enabled, the sign-in screen displays only the OAuth sign-in buttons (Google and/or Microsoft), and all password-related operations are blocked.

**When `disable_password_auth` is enabled:**

- The email/password sign-in form is hidden from the sign-in screen
- The "Forgot Password?" link is removed
- Password-based sign-in attempts are rejected
- The `_sendPasswordResetEmail` GraphQL mutation is excluded from the schema
- OAuth (Google and/or Microsoft) becomes the sole authentication method

**Configuration:**

- `disable_password_auth` (boolean) - Disables password-based authentication for this namespace. Defaults to `false`.

**Requirements:**

- `allow_google_oauth` or `allow_microsoft_oauth` must be `true` (at least one authentication method must remain available)
- `allowed_email_domains` must be set (required by `allow_google_oauth`)
- `allow_self_password_reset` must be `false` (cannot enable password reset when password authentication is disabled)

**Example Configuration:**

```typescript
import { defineIdp } from "@tailor-platform/sdk";

export const builtinIdp = defineIdp("builtin-idp", {
  clients: ["main-client"],
  permission: {
    create: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    read: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    update: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    delete: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    sendPasswordResetEmail: [
      { conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true },
    ],
  },
  userAuthPolicy: {
    allowGoogleOauth: true,
    allowedEmailDomains: ["example.com"],
    disablePasswordAuth: true,
  },
});
```

:::warning
When `disable_password_auth` is enabled, existing users who previously signed in with a password will need to use Google OAuth or Microsoft OAuth instead. Ensure that all users have accounts with the configured OAuth provider and email addresses in the allowed domains before enabling this setting.
:::

### Email Configuration

The Built-in IdP allows you to customize the sender name and subject line for emails sent by the IdP (such as password reset emails). You can configure namespace-level defaults using the `emailConfig` option, and optionally override them per request.

**Priority chain** (highest to lowest):

1. **Per-request parameter** — `fromName` / `subject` passed in `_sendPasswordResetEmail` or `tailor.idp.sendPasswordResetEmail`
2. **Namespace default** — configured in `emailConfig`
3. **Hardcoded default** — `"Tailor Platform IdP"` for sender name, localized default for subject

**Configuration:**

- `fromName` (string, optional) — Default sender display name for emails. Max 200 characters. When omitted, falls back to `"Tailor Platform IdP"`.
- `passwordResetSubject` (string, optional) — Default subject line for password reset emails. Max 200 characters. When omitted, falls back to the localized default subject.

**Example Configuration:**

```typescript
import { defineIdp } from "@tailor-platform/sdk";

export const builtinIdp = defineIdp("builtin-idp", {
  clients: ["main-client"],
  permission: {
    create: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    read: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    update: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    delete: [{ conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true }],
    sendPasswordResetEmail: [
      { conditions: [[{ user: "role" }, "=", "ADMIN"]], permit: true },
    ],
  },
  emailConfig: {
    fromName: "My App Support",
    passwordResetSubject: "Reset your My App password",
  },
});
```

With this configuration, password reset emails will be sent as `My App Support <no-reply@idp.erp.dev>` with the subject "Reset your My App password", unless overridden per request.

### Why Use the Built-In IdP

- **Unified API with Automatic Schema Generation**: When registered as subgraphs, both services automatically contribute their schemas to your application's GraphQL API, making all authentication and user management operations available through a single GraphQL endpoint and simplifying client integration.

- **Centralized Configuration**: All authentication settings are managed through your application configuration, providing a single source of truth.

- **Flexible Authentication**: Support for both email and username-based authentication through the `user_auth_policy` configuration, with optional Google OAuth and Microsoft OAuth integration for streamlined sign-in.

For detailed configuration parameters for each resource, refer to the [Terraform provider documentation](https://registry.terraform.io/providers/tailor-platform/tailor/latest/docs/resources/idp).

## User Management

When you register a Built-in IdP service in your application's subgraph, it automatically adds a GraphQL schema for user management. This enables you to manage IdP users directly through GraphQL operations, providing a programmatic interface for user administration.

### Registering IdP as a Subgraph

To enable GraphQL user management, include the IdP service in your application's subgraphs configuration:

```typescript
import { defineIdp } from "@tailor-platform/sdk";

export const builtinIdp = defineIdp("builtin-idp", {
  clientId: "your-client-id",
  oidcConfiguration: {
    issuer: "https://your-builtin-idp-provider-url",
  },
});
```

### Available GraphQL Operations

Once registered, the IdP subgraph provides the following GraphQL operations for user management:

**Query Operations:**

- `_users` - List IdP users with pagination and filtering
- `_user` - Get a specific IdP user by ID
- `_userBy` - Get a specific IdP user by ID or name

**Mutation Operations:**

- `_createUser` - Create a new IdP user
- `_updateUser` - Update an existing IdP user
- `_deleteUser` - Delete an IdP user
- `_sendPasswordResetEmail` - Send a password reset email to an IdP user

### GraphQL Examples

Here are practical examples of user management operations:

**Query all IdP users:**

```graphql
query GetUsers {
  _users(first: 10) {
    edges {
      node {
        id
        name
        createdAt
        disabled
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

**Query IdP users with filtering:**

```graphql
query GetUsersByName {
  _users(first: 5, query: { names: ["john.doe", "jane.smith"] }) {
    edges {
      node {
        id
        name
        disabled
      }
    }
  }
}
```

**Get a specific IdP user:**

```graphql
query GetUser($userId: ID!) {
  _user(id: $userId) {
    id
    name
    createdAt
    disabled
  }
}
```

**Get an IdP user by ID or name:**

The `_userBy` query allows you to fetch a single user by exactly one of `id` or `name`. Exactly one argument must be provided — specifying both or neither returns an error.

```graphql
# By ID
query GetUserById {
  _userBy(id: "user-uuid") {
    id
    name
    createdAt
    disabled
  }
}

# By name
query GetUserByName {
  _userBy(name: "foo@example.com") {
    id
    name
    createdAt
    disabled
  }
}
```

**Create a new IdP user:**

```graphql
mutation CreateUser($input: _CreateUserInput!) {
  _createUser(input: $input) {
    id
    name
    createdAt
    disabled
  }
}
```

Variables:

```json
{
  "input": {
    "name": "john.doe",
    "password": "secure-password-123",
    "disabled": false
  }
}
```

**Update an IdP user:**

```graphql
mutation UpdateUser($input: _UpdateUserInput!) {
  _updateUser(input: $input) {
    id
    name
    disabled
  }
}
```

Variables:

```json
{
  "input": {
    "id": "user-id-here",
    "name": "john.doe.updated",
    "disabled": true
  }
}
```

**Delete an IdP user:**

```graphql
mutation DeleteUser($userId: ID!) {
  _deleteUser(id: $userId)
}
```

**Send a password reset email:**

This mutation sends a password reset email to an IdP user. It can be used both for resetting existing IdP users' passwords and for setting initial passwords for newly created IdP users.

```graphql
mutation SendPasswordResetEmail($input: _SendPasswordResetEmailInput!) {
  _sendPasswordResetEmail(input: $input)
}
```

Variables:

```json
{
  "input": {
    "userId": "user-id-here",
    "redirectUri": "https://your-app.com/reset-password-complete",
    "fromName": "My App Support",
    "subject": "Password Reset for Your My App Account"
  }
}
```

**Input fields:**

- `userId` (ID!, required) — The ID of the user to send the password reset email to.
- `redirectUri` (String!, required) — The URL to redirect the user to after they reset their password. Must be a valid absolute URL with `http` or `https` scheme.
- `fromName` (String, optional) — Overrides the sender display name for this email. When omitted, falls back to the namespace-level `emailConfig.fromName`, then to `"Tailor Platform IdP"`.
- `subject` (String, optional) — Overrides the email subject line for this email. When omitted, falls back to the namespace-level `emailConfig.passwordResetSubject`, then to the localized default.

Password reset emails are sent from `no-reply@idp.erp.dev`. This operation is only available when `use_non_email_identifier` is set to `false` (the default), as it requires users to have email addresses.

User management operations are available only when the IdP service is registered as a subgraph in your application configuration. The GraphQL schema is automatically generated based on the IdP service specification.

## Next Steps

- [Configure user roles and permissions](/guides/tailordb/permission)
- [Set up machine users for API access](/guides/auth/overview#machineuser)
- [Learn about Auth as a subgraph](/guides/auth/overview#authasasubgraph)
