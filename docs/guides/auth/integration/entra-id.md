---
description: "Set up Microsoft Entra ID as an identity provider for the Auth service with OIDC."
doc_type: guide
---

# Microsoft Entra ID Integration

Microsoft Entra ID (formerly Azure Active Directory) is Microsoft's cloud-based identity and access management service. This guide walks you through setting up Microsoft Entra ID as your Identity Provider with the Tailor Platform Auth service using OIDC.

## Prerequisites

- An active Microsoft Entra ID tenant with admin privileges
- A Tailor Platform workspace with Auth service enabled
- Basic understanding of OIDC protocols

## Setting up Microsoft Entra ID for OIDC

### Step 1: Register an Application in Entra ID

1. Sign in to the [Microsoft Entra admin center](https://entra.microsoft.com/)
2. Navigate to **App registrations**
3. Click **New registration**
4. Configure your application:
   - **Name**: Your application name (e.g., "Tailor Platform App")
   - **Supported account types**: Choose based on your requirements
     - **Accounts in this organizational directory only** (Single tenant)
     - **Accounts in any organizational directory** (Multi-tenant)
   - **Redirect URI**: Select **Web** and add:
     ```
     https://{your-app-domain}/oauth2/callback
     ```
5. Click **Register**

### Step 2: Configure Application Settings

After registration, configure the following settings:

**Authentication:**

1. Go to **Authentication** in the left menu
2. Under **Redirect URIs**, ensure your callback URL is correctly configured
3. Select **Settings** tab, for **Implicit grant and hybrid flows**, enable:
   - **ID tokens** (used for sign-in)
4. Click **Save**

**Certificates & secrets:**

1. Go to **Certificates & secrets** in the left menu
2. Click **New client secret**
3. Add a description and choose expiration period
4. Click **Add** and copy the secret value immediately

### Step 3: Get Application Information

Note down the following information from the **Overview** page:

- **Application (client) ID**: Your client ID
- **Directory (tenant) ID**: Your tenant ID
- **Client secret**: The secret value you created

### Step 4: Configure API Permissions (Optional)

If you need additional user information:

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add permissions like:
   - `User.Read` (to read user profile)
   - `email` (to access email address)
   - `profile` (to access basic profile information)
6. Click **Grant admin consent** if required

## Configuring Auth Service

Once your Entra ID application is set up, configure the Auth service in your Tailor Platform application:

```typescript
import { defineAuth } from "@tailor-platform/sdk";
import { user } from "./tailordb/user";

// Configure Auth service to use Entra ID
export const auth = defineAuth("main-auth", {
  userProfile: {
    type: user,
    usernameField: "email",
    attributes: {
      email: true,
      firstName: true,
      lastName: true,
    },
  },
  idProvider: {
    name: "entra-id-oidc",
    kind: "OIDC",
    clientID: process.env.ENTRA_ID_CLIENT_ID!,
    // Store the client secret in Secret Manager and reference it by vault/key
    clientSecret: { vaultName: "default", secretKey: "entra-id-client-secret" },
    providerURL: "https://login.microsoftonline.com/{tenant-id}/v2.0",
  },
});
```

## Testing the Integration

After configuring both Entra ID and the Auth service:

1. Deploy your Tailor Platform application
2. Create users in Entra ID and add them to the Tailor platform
3. Login to your application using the Tailor CLI
4. You should be redirected to Microsoft Entra ID for authentication
5. After successful authentication, you'll be redirected back to your application

## Troubleshooting

### Common Issues

**Invalid Redirect URI**

- Ensure the redirect URI in Entra ID matches exactly what's configured in your Auth service
- Check for trailing slashes and protocol mismatches (http vs https)

**Invalid Client Credentials**

- Verify your client ID and client secret are correct
- Ensure the client secret hasn't expired
- Check that the secret is properly stored in your secret manager

**Tenant Configuration Issues**

- Verify the tenant ID in your provider URL is correct
- For multi-tenant apps, ensure you're using the correct tenant endpoint
- Check that the application is properly registered in the correct tenant

**User Profile Not Created**

- Check that your TailorDB User type has the correct username field configured
- Verify that the email claim is being passed from Entra ID
- Ensure the user has the necessary permissions in Entra ID

**Token Validation Errors**

- Verify the audience claim in the token matches your application
- Check that the issuer claim matches the expected Entra ID issuer
- Ensure your application's clock is synchronized

For production deployments, ensure you're using HTTPS URLs and have proper SSL certificates configured. Also, consider implementing proper token caching and refresh mechanisms.

## Next Steps

- [Log in to your app](/guides/auth/app-login) - Guide for user creation and login
- [Configure user roles and permissions](/guides/tailordb/permission)
- [Set up machine users for API access](/guides/auth/overview#machineuser)
- [Learn about Auth as a subgraph](/guides/auth/overview#authasasubgraph)
