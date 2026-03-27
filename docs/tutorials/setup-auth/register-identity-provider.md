# Register Identity provider with Auth service

To enable authentication through an identity provider, you need to register it with the Auth service. In this tutorial, you'll learn how to register IdPs for different authentication protocols using the Tailor Platform SDK.

## Prerequisites

- Complete the [SDK Quickstart](../../sdk/quickstart)
- [Set up the IdP](setup-identity-provider)
- Have your IdP credentials ready (client ID, client secret, provider URL, etc.)

## Tutorial Steps

1. Register IdP with the Auth service for each protocol (OIDC, SAML, ID Token)
2. Deploy the changes

## 1. Register IdP with the Auth Service

### OIDC (OpenID Connect)

Update your `tailor.config.ts` to include the Auth service with OIDC configuration:

```typescript
import { defineConfig, t } from "@tailor-platform/sdk";

export default defineConfig({
  name: "project-management",
  db: {
    "main-db": {
      files: ["db/**/*.ts"],
    },
  },
  auth: {
    namespace: "project-management-auth",
    idpConfigs: [
      {
        name: "oidc-provider",
        oidc: {
          clientId: process.env.OIDC_CLIENT_ID!,
          clientSecret: {
            vaultName: "my-vault",
            secretName: "oidc-client-secret",
          },
          providerUrl: process.env.OIDC_PROVIDER_URL!,
        },
      },
    ],
    userProfileConfig: {
      tailordb: {
        namespace: "main-db",
        type: "User",
        usernameField: "email",
        attributeFields: ["roles"],
      },
    },
  },
});
```

**Environment Variables:**

Create a `.env` file in your project root:

```bash
OIDC_CLIENT_ID=your_auth0_client_id
OIDC_PROVIDER_URL=https://your-domain.us.auth0.com
```

**Store the Client Secret:**

Before deploying, you need to store your client secret in the secret manager. Run these commands:

```bash
# Create a vault
tailor-sdk secret vault create my-vault

# Store the client secret
tailor-sdk secret create \
  --vault-name my-vault \
  --name oidc-client-secret \
  --value YOUR_CLIENT_SECRET
```

**Vault naming rules:** Only lowercase letters (a-z), numbers (0-9), and hyphens (-). Must start and end with a letter or number, 2-62 characters long.

**User Type Definition:**

Make sure you have a User type defined in your database schema (e.g., `db/user.ts`):

```typescript
import { t } from "@tailor-platform/sdk";

export const User = t.object({
  id: t.uuid(),
  email: t.string().email(),
  name: t.string(),
  roles: t.array(t.string()).optional(),
});
```

### SAML

The Tailor Platform provides a built-in key for signing SAML authentication requests. When request signing is enabled, the platform automatically signs requests sent from the SP to the IdP. The SP metadata, including the public key for signature verification, is available at `https://api.tailor.tech/saml/{workspace_id}/{auth_namespace}/metadata.xml`.

Update your `tailor.config.ts` to include SAML configuration:

```typescript
import { defineConfig } from "@tailor-platform/sdk";

export default defineConfig({
  name: "project-management",
  db: {
    "main-db": {
      files: ["db/**/*.ts"],
    },
  },
  auth: {
    namespace: "project-management-auth",
    idpConfigs: [
      {
        name: "saml-provider",
        saml: {
          metadataUrl: process.env.SAML_METADATA_URL!,
          // Alternative: use rawMetadata for inline XML
          // rawMetadata: `<?xml version="1.0"?>...`,
          enableSignRequest: false, // Set to true to enable request signing
        },
      },
    ],
    userProfileConfig: {
      tailordb: {
        namespace: "main-db",
        type: "User",
        usernameField: "email",
        attributeFields: ["roles"],
      },
    },
  },
});
```

**Configuration Properties:**

| Property              | Description                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **metadataUrl**       | Metadata URL of the identity provider **(required if rawMetadata is not provided)**.                                                                   |
| **rawMetadata**       | Raw SAML metadata XML string **(required if metadataUrl is not provided)**.                                                                            |
| **enableSignRequest** | Whether to enable signing of SAML authentication requests (optional, defaults to `false`). When enabled, the platform uses a built-in key for signing. |

**Environment Variables:**

Add to your `.env` file:

```bash
SAML_METADATA_URL=https://your-idp.com/saml/metadata
```

The metadata URL is provided by your Identity Provider (IdP). You can typically find this in your IdP's SAML application settings.

### ID Token

For ID Token-based authentication, update your `tailor.config.ts`:

```typescript
import { defineConfig } from "@tailor-platform/sdk";

export default defineConfig({
  name: "project-management",
  db: {
    "main-db": {
      files: ["db/**/*.ts"],
    },
  },
  auth: {
    namespace: "project-management-auth",
    idpConfigs: [
      {
        name: "idtoken-provider",
        idToken: {
          clientId: process.env.ID_TOKEN_CLIENT_ID!,
          providerUrl: process.env.ID_TOKEN_PROVIDER_URL!,
        },
      },
    ],
    userProfileConfig: {
      tailordb: {
        namespace: "main-db",
        type: "User",
        usernameField: "email",
        attributeFields: ["roles"],
      },
    },
  },
});
```

**Environment Variables:**

Add to your `.env` file:

```bash
ID_TOKEN_CLIENT_ID=your_auth0_client_id
ID_TOKEN_PROVIDER_URL=https://your-domain.us.auth0.com
```

Replace with your Auth0 client ID and domain.

## 2. Deploy the Changes

Deploy your application with the Auth configuration:

```bash
npm run deploy -- --workspace-id <your-workspace-id>
```

The SDK will deploy the Auth service with your IdP configuration.

**Verification:**

1. Open the [Console](https://console.tailor.tech) and navigate to your workspace
2. Go to the Auth section to verify your IdP configuration
3. Test the authentication flow with your IdP

**Multiple IdP Configurations:**

You can register multiple identity providers in the same application:

```typescript
export default defineConfig({
  name: "project-management",
  auth: {
    namespace: "project-management-auth",
    idpConfigs: [
      {
        name: "oidc-provider",
        oidc: {
          /* ... */
        },
      },
      {
        name: "saml-provider",
        saml: {
          /* ... */
        },
      },
      {
        name: "idtoken-provider",
        idToken: {
          /* ... */
        },
      },
    ],
    userProfileConfig: {
      tailordb: {
        namespace: "main-db",
        type: "User",
        usernameField: "email",
        attributeFields: ["roles"],
      },
    },
  },
});
```

You can now use your Auth service to manage access to resources.

## Next Steps

- [Create user](login/create-user) - Learn how to create users in your application
- [Create an OAuth2 client](login/create-oauth2-client) - Securely authenticate and authorize access to your data
- [Auth Service Documentation](../../sdk/services/auth) - Complete Auth service reference
