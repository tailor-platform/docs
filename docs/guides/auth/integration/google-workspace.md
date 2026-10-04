---
title: Google Workspace Integration
description: "Set up Google Workspace as a SAML identity provider for enterprise SSO with the Auth service."
doc_type: guide
preview: true
---

# Google Workspace Integration <PreviewTag />

Google Workspace (formerly G Suite) is Google's cloud-based productivity and collaboration platform. This guide shows how to integrate Google Workspace with the Tailor Platform Auth service for enterprise SSO using SAML.

## Prerequisites

- Google Workspace admin account
- A Tailor Platform workspace with Auth service enabled
- Basic understanding of SAML protocols

## Setting up Google Workspace for SAML

### Step 1: Access Admin Console

1. Sign in to the [Google Admin Console](https://admin.google.com/)
2. Navigate to **Apps** > **Web and mobile apps**
3. Click **Add app** > **Add custom SAML app**

### Step 2: Configure SAML Application

**App details:**

- **App name**: Your application name
- **Description**: Brief description
- **App icon**: Upload your application logo (optional)

**Google Identity Provider details:**

- Download the metadata XML file from Google (you'll need this for the Auth service configuration)

**Service Provider details:**

- **ACS URL**:
  ```
  https://{your-app-domain}/oauth2/callback
  ```
- **Entity ID**:
  ```
  https://api.tailor.tech/saml/{workspace_id}/{auth_namespace}/metadata.xml
  ```
- **Name ID format**: EMAIL
- **Name ID**: Basic Information > Primary email

### Step 3: Configure Attribute Mapping

Map Google Workspace attributes to your application:

| Google Directory attributes | App attributes |
| --------------------------- | -------------- |
| Primary email               | email          |
| First name                  | firstName      |
| Last name                   | lastName       |

## Configuring Auth Service

To configure the Auth service, you’ll need to download the Google Workspace IdP metadata XML. You can either:

- **Use the metadata URL**: Google provides a metadata URL that can be used directly in the configuration
- **Use the raw XML metadata**: Download the XML and provide it as an environment variable (e.g., `process.env.GOOGLE_SAML_METADATA`)

### Configuration

```typescript
import { defineAuth, defineIdp } from "@tailor-platform/sdk";
import { user } from "./tailordb/user";

// Define the Google Workspace SAML IdP
export const googleSaml = defineIdp("google-saml", {
  clientId: "your-client-id",
  samlConfiguration: {
    metadataUrl: "https://accounts.google.com/o/saml2?idpid={your-idp-id}",
    // Or provide the XML metadata directly:
    // rawMetadata: process.env.GOOGLE_SAML_METADATA,
  },
});

// Configure Auth service to use Google SAML
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
  idProvider: googleSaml.provider("google-saml-provider"),
});
```

## Domain Verification

For Google Workspace SAML integration, you may need to verify domain ownership:

1. In Google Admin Console, go to **Security** > **Set up single sign-on (SSO)**
2. Add your application domain to the verified domains list
3. Follow Google's domain verification process

## Troubleshooting

### Common Issues

**Domain Not Verified**

- Complete Google's domain verification process
- Ensure DNS records are properly configured

**SAML Assertion Errors**

- Verify Entity ID matches exactly
- Ensure user has access to the application

## Next Steps

- [Log in to your app](/guides/auth/app-login) - Guide for user creation and login
- [Configure user roles and permissions](/guides/tailordb/permission)
- [Set up machine users for API access](/guides/auth/overview#machineuser)
- [Learn about Auth as a subgraph](/guides/auth/overview#authasasubgraph)
