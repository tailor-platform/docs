# Setting up Auth

In this tutorial, you'll learn key concepts and techniques that are fundamental to using Auth service.

The [Auth service](/guides/auth/overview) authorizes application users and manages their access to resources.
It provides a set of APIs to authenticate users and control their access to various resources.

For a comprehensive overview of Auth service capabilities and supported Identity Providers, see the [Auth service guide](/guides/auth/overview). To learn about querying user information when Auth is used as a subgraph, see [Auth as a Subgraph](/guides/auth/overview#authasasubgraph).

## Prerequisite

- Complete [Quickstart](/getting-started/quickstart)&#x20;

There are various approaches to obtaining an access token depending on the type of protocol being used.

In this section, you will explore two approaches for obtaining access tokens.

The first approach focuses on logging in using an OAuth2 client, leveraging OIDC or SAML protocols to obtain an access token.

The second approach is to request an ID token from your identity provider, then use it to get an access token from your app's OAuth2 API.

## What you'll learn

- [Set up the IdP](setup-identity-provider)
- [Register the IdP with Tailor PF Auth service](register-identity-provider)
- [Create users](login/create-user)
- [Create an OAuth2 client](login/create-oauth2-client)
- [Log in using ID token](login/id-token)
- [Set up Auth Connections](setup-auth-connections)
