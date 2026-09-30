---
description: "Set up Auth0 as an identity provider for the Auth service using OIDC, SAML or ID token authentication."
doc_type: guide
---

# Auth0 Integration

Auth0 is a flexible identity platform that provides authentication and authorization services for applications. This guide demonstrates how to integrate Auth0 with the Tailor Platform Auth service using OIDC, SAML, or ID Token authentication methods.

## Prerequisites

- An active Auth0 account
- A Tailor Platform workspace with Auth service enabled
- Basic understanding of authentication protocols

## Setting up Auth0 for OIDC

### Step 1: Create an Application

1. Log in to your Auth0 Dashboard
2. Navigate to **Applications** > **Applications**
3. Click **Create Application**
4. Choose **Regular Web Applications** as the application type
5. Click **Create**

### Step 2: Configure Application Settings

In your application settings, configure:

**Basic Information:**

- **Name**: Your application name
- **Description**: Brief description of your application

**Application URIs:**

- **Allowed Callback URLs**:
  ```
  https://{your-app-domain}/oauth2/callback
  ```
- **Allowed Logout URLs**:
  ```
  https://{your-app-domain}/logout
  ```
- **Allowed Web Origins**:
  ```
  https://{your-app-domain}
  ```

### Step 3: Get Application Credentials

From the application settings, note:

- **Domain**: Your Auth0 domain (e.g., `dev-12345.us.auth0.com`)
- **Client ID**: Your application's client ID
- **Client Secret**: Your application's client secret

## Setting up Auth0 for SAML

### Step 1: Enable SAML2 Web App Addon

1. In your Auth0 application, go to the **Addons** tab
2. Enable **SAML2 WEB APP**
3. Click on the addon to configure it

### Step 2: Configure SAML Settings

In the SAML2 addon settings:

**Application Callback URL:**

```
https://{your-app-domain}/oauth2/callback
```

**Settings (JSON):**

```json
{
  "audience": "https://api.tailor.tech/saml/{workspace_id}/{auth_namespace}/metadata.xml",
  "nameIdentifierFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
  "nameIdentifierProbes": ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
}
```

### Step 3: Download Metadata

After saving the settings, download the SAML metadata from:

```
https://{your-auth0-domain}/samlp/metadata/{client-id}
```

## Setting up Auth0 for ID Token

### Step 1: Configure Application

Follow the same steps as OIDC setup, but additionally:

1. Go to **Advanced Settings** > **Grant Types**
2. Enable **Password** grant type (for testing purposes)

### Step 2: Configure Tenant Settings

1. Navigate to **Settings** > **General**
2. In **API Authorization Settings**, set:
   - **Default Directory**: `Username-Password-Authentication`

## Configuring Auth Service

Configure your Tailor Platform Auth service to work with Auth0:

```typescript
import { defineAuth, defineIdp } from "@tailor-platform/sdk";
import { user } from "./tailordb/user";

// OIDC Configuration
export const auth0Oidc = defineIdp("auth0-oidc", {
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  oidcConfiguration: {
    issuer: "https://{your-auth0-domain}",
  },
});

// SAML Configuration (alternative)
export const auth0Saml = defineIdp("auth0-saml", {
  clientId: "your-client-id",
  samlConfiguration: {
    metadataUrl: "https://{your-auth0-domain}/samlp/metadata/{client-id}",
  },
});

// ID Token Configuration (alternative)
export const auth0IdToken = defineIdp("auth0-id-token", {
  clientId: "your-client-id",
  idTokenConfiguration: {
    issuer: "https://{your-auth0-domain}",
  },
});

// Configure Auth service to use Auth0 (choose OIDC, SAML, or ID Token)
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
  // Use one of the IdP configurations
  idProvider: auth0Oidc.provider("auth0-oidc-provider"),
  // idProvider: auth0Saml.provider("auth0-saml-provider"),
  // idProvider: auth0IdToken.provider("auth0-id-token-provider"),
});
```

## Testing with ID Token

For testing purposes, you can obtain an ID token directly from Auth0:

```bash
curl --request POST \
  --url 'https://{your-auth0-domain}/oauth/token' \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data grant_type=password \
  --data username={user-email} \
  --data password={user-password} \
  --data audience={api-identifier} \
  --data scope=openid \
  --data client_id={client-id} \
  --data client_secret={client-secret}
```

Then use the returned ID token with your Tailor Platform application.

## Troubleshooting

### Common Issues

**Invalid Grant Type**

- Ensure the correct grant types are enabled in your Auth0 application
- For production, disable Password grant and use Authorization Code flow

**CORS Errors**

- Add your application domain to Allowed Web Origins in Auth0
- Ensure HTTPS is used for production environments

Auth0 offers extensive customization options through Rules, Actions, and Hooks. Explore these features to tailor the authentication flow to your specific needs.

## Next Steps

- [Log in to your app](/guides/auth/app-login) - Guide for user creation and login
- [Configure user roles and permissions](/guides/tailordb/permission)
- [Set up machine users for API access](/guides/auth/overview#machineuser)
- [Learn about Auth as a subgraph](/guides/auth/overview#authasasubgraph)
