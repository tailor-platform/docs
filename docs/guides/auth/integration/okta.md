---
description: "Set up Okta as an identity provider for the Auth service using OIDC or SAML."
doc_type: guide
---

# Okta Integration

Okta is an enterprise-grade identity and access management platform that provides secure authentication and authorization services. This guide walks you through setting up Okta as your Identity Provider with the Tailor Platform Auth service.

## Prerequisites

- An active Okta account with admin privileges
- A Tailor Platform workspace with Auth service enabled
- Basic understanding of OIDC or SAML protocols

## Setting up Okta for OIDC

### Step 1: Create an Application in Okta

1. Log in to your Okta Admin Console
2. Navigate to **Applications** > **Applications**
3. Click **Create App Integration**
4. Select **OIDC - OpenID Connect** as the sign-in method
5. Choose **Web Application** as the application type
6. Click **Next**

### Step 2: Configure Application Settings

Configure your application with the following settings:

- **App integration name**: Your application name (e.g., "Tailor Platform App")
- **Grant type**: Select **Authorization Code**
- **Sign-in redirect URIs**: Add your callback URL
  ```
  https://{your-app-domain}/oauth2/callback
  ```
- **Sign-out redirect URIs**: Add your logout URL (optional)
- **Assignments**: Choose who can access this application

### Step 3: Get Application Credentials

After creating the application, note down:

- **Client ID**: Found in the application's General tab
- **Client Secret**: Found in the application's General tab
- **Okta Domain**: Your Okta organization URL (e.g., `https://dev-12345.okta.com`)

## Setting up Okta for SAML

### Step 1: Create a SAML Application

1. In Okta Admin Console, go to **Applications** > **Applications**
2. Click **Create App Integration**
3. Select **SAML 2.0** as the sign-in method
4. Click **Next**

### Step 2: Configure SAML Settings

**General Settings:**

- **App name**: Your application name
- **App logo**: Upload your application logo (optional)

**SAML Settings:**

- **Single sign on URL**:
  ```
  https://{your-app-domain}/oauth2/callback
  ```
- **Audience URI (SP Entity ID)**:
  ```
  https://api.tailor.tech/saml/{workspace_id}/{auth_namespace}/metadata.xml
  ```
- **Name ID format**: EmailAddress
- **Application username**: Email

### Step 3: Configure Attribute Statements

Add attribute statements to map Okta user attributes to your application:

| Name      | Name format | Value          |
| --------- | ----------- | -------------- |
| email     | Basic       | user.email     |
| firstName | Basic       | user.firstName |
| lastName  | Basic       | user.lastName  |

## Configuring Auth Service

Once your Okta application is set up, configure the Auth service in your Tailor Platform application:

```typescript
import { defineAuth } from "@tailor-platform/sdk";
import { user } from "./tailordb/user";

// Configure Auth service to use Okta (choose OIDC or SAML)
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
  // OIDC configuration
  idProvider: {
    name: "okta-oidc",
    kind: "OIDC",
    clientID: process.env.OKTA_CLIENT_ID!,
    // Store the client secret in Secret Manager and reference it by vault/key
    clientSecret: { vaultName: "default", secretKey: "okta-client-secret" },
    providerURL: "https://{your-okta-domain}",
  },
  // SAML configuration (alternative)
  // idProvider: {
  //   name: "okta-saml",
  //   kind: "SAML",
  //   enableSignRequest: false,
  //   metadataURL: "https://{your-okta-domain}/app/{app_id}/sso/saml/metadata",
  // },
});
```

## Testing the Integration

After configuring both Okta and the Auth service:

1. Deploy your Tailor Platform application
2. Login to your application using the Tailor CLI
3. You should be redirected to Okta for authentication
4. After successful authentication, you'll be redirected back to your application

## Troubleshooting

### Common Issues

**Invalid Redirect URI**

- Ensure the redirect URI in Okta matches exactly what's configured in your Auth service
- Check for trailing slashes and protocol mismatches

**Metadata URL Not Found**

- Verify your Okta domain and application ID in the metadata URL
- Ensure the SAML application is active and properly configured

**User Profile Not Created**

- Check that your TailorDB User type has the correct username field configured
- Verify that the email attribute is being passed from Okta

For production deployments, ensure you're using HTTPS URLs and have proper SSL certificates configured.

## Next Steps

- [Log in to your app](/guides/auth/app-login) - Guide for user creation and login
- [Configure user roles and permissions](/guides/tailordb/permission)
- [Set up machine users for API access](/guides/auth/overview#machineuser)
- [Learn about Auth as a subgraph](/guides/auth/overview#authasasubgraph)
