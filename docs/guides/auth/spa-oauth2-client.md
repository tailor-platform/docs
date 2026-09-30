---
description: "Choose between Public and Browser OAuth2 clients for single-page apps, and the security settings each needs."
doc_type: guide
---

# OAuth2 Client Selection for SPAs

When building Single Page Applications (SPAs) on the Tailor Platform, choosing the right OAuth2 client type is crucial for balancing security and browser compatibility. This guide explains the security considerations and trade-offs between using a Public client and a Browser client for SPA development.

## Client Type Options for SPAs

Tailor Platform supports two OAuth2 client types suitable for SPAs:

**Public Client** is designed for applications that cannot securely store client secrets, such as mobile apps and SPAs. When used for SPAs, additional security measures are required to protect against token theft and replay attacks.

**Browser Client** provides enhanced security through HTTP-only cookies, preventing JavaScript access to tokens. However, it has browser compatibility limitations due to third-party cookie restrictions.

## Public Client for SPAs

When using a Public client for SPA applications, you must enable additional security measures to protect tokens that are accessible to JavaScript.

### Required Security Configuration

To securely use a Public client in an SPA, the following configurations are **required**:

1. **Require DPoP (Demonstration of Proof-of-Possession)**: DPoP binds tokens to a specific client by requiring cryptographic proof of possession. This prevents stolen tokens from being used by attackers.

2. **Set a short access token lifetime**: Limiting the access token lifetime reduces the window of opportunity for token misuse if a token is compromised.

Combined with **refresh token rotation** (enabled by default), these measures ensure that even if tokens are intercepted, they cannot be easily reused by attackers.

### Configuration Example

**SDK Configuration:**

```typescript
import { defineAuth } from "@tailor-platform/sdk";

export const authConfig = defineAuth("my-auth", {
  oauth2Clients: {
    "spa-public-client": {
      description: "Public OAuth2 client for SPA with DPoP",
      clientType: "public",
      redirectURIs: [
        "http://localhost:3000/__oauth/callback",
        "https://myapp.example.com/__oauth/callback",
      ],
      grantTypes: ["authorization_code", "refresh_token"],

      // Required for SPA security
      requireDPoP: true,
      accessTokenLifetime: "15m",
      refreshTokenLifetime: "7d", // default
    },
  },
});
```

### Security Properties

| Property               | Description                                                                                                                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `requireDPoP`          | When `true`, requires DPoP proof for all token requests. This binds tokens to the client's cryptographic key pair. DPoP is always available for clients to use; this setting controls whether the server enforces its use. |
| `accessTokenLifetime`  | Sets the access token expiration. Use short values like `"15m"` for SPAs. Maximum is 24 hours. Specified as a duration string (e.g., "15m", "1h").                                                                         |
| `refreshTokenLifetime` | Sets the refresh token expiration. Default is 7 days. On rotation, the new token's expiration does not extend beyond the original token's lifetime.                                                                        |

### Security Mechanisms

Tailor Platform uses three complementary mechanisms to secure Public clients in SPAs, as specified in [draft-ietf-oauth-browser-based-apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps) (OAuth 2.0 for Browser-Based Applications):

1. **PKCE (Proof Key for Code Exchange)** - Protects the authorization code exchange by requiring a code verifier that only the legitimate client possesses. This is enabled by default for all Public clients.

2. **DPoP (Demonstration of Proof-of-Possession)** - Binds tokens to the client's cryptographic key pair, preventing stolen tokens from being used by attackers.

3. **DPoP-Nonce** - A server-provided nonce that must be included in DPoP proofs, preventing replay attacks by ensuring each proof is unique and tied to a specific server interaction.

Together, these mechanisms implement the Sender-Constrained Tokens pattern, providing robust protection for SPAs.

#### How It Works

1. The SPA generates a public/private key pair
2. When requesting tokens, the SPA creates a signed DPoP proof using the private key
3. The authorization server binds the issued tokens to the public key
4. When using the access token, the SPA must include a fresh DPoP proof with the server-provided nonce
5. If an attacker steals the token, they cannot use it without the private key

### Token Storage Considerations

> **Security Warning**: When using a Public client, tokens are stored in browser storage (such as localStorage or sessionStorage) which is accessible to JavaScript. If your application has an XSS vulnerability, malicious scripts could potentially access these tokens. While DPoP significantly mitigates this risk by making stolen tokens unusable without the private key, it cannot prevent malicious code running in the same context from obtaining new token sets. Always follow XSS prevention best practices and consider using a Browser client if Safari support is not required.

## Browser Client

Browser clients use HTTP-only cookies to store tokens, which provides stronger security by preventing JavaScript from accessing the tokens directly.

### Security Benefits

Browser clients offer enhanced protection against common web vulnerabilities:

- **XSS Protection**: Tokens stored in HTTP-only cookies cannot be accessed by malicious JavaScript, even if an XSS vulnerability exists
- **Automatic Token Handling**: The browser automatically includes cookies in requests, simplifying token management
- **CSRF Protection**: Tailor Platform requires a custom `X-Tailor-Nonce` header to defend against CSRF attacks

### Configuration Example

**SDK Configuration:**

```typescript
import { defineAuth } from "@tailor-platform/sdk";

export const authConfig = defineAuth("my-auth", {
  oauth2Clients: {
    "spa-browser-client": {
      description: "Browser OAuth2 client for SPA",
      clientType: "browser",
      redirectURIs: [
        "http://localhost:3000/__oauth/callback",
        "https://myapp.example.com/__oauth/callback",
      ],
      grantTypes: ["authorization_code", "refresh_token"],
    },
  },
});
```

### Browser Compatibility Limitation

> **Safari Limitation**: Browser clients do not work reliably in Safari due to its Intelligent Tracking Prevention (ITP) feature. ITP blocks third-party cookies, which prevents the HTTP-only cookies used by browser clients from being stored or sent correctly. If your application needs to support Safari users, use a Public client with DPoP and short token lifetime instead.

## Client Type Selection Guide

Use the following table to determine which client type best fits your requirements:

| Requirement                     | Recommended Client | Configuration Notes                                                    |
| ------------------------------- | ------------------ | ---------------------------------------------------------------------- |
| Safari support needed           | Public Client      | Require DPoP (`requireDPoP: true`) and set short access token lifetime |
| More secure (Safari not needed) | Browser Client     | Uses HTTP-only cookies for token storage                               |
| Shared codebase with mobile app | Public Client      | Same client type works across web and mobile platforms                 |

### Decision Flowchart

1. **Does your SPA need to support Safari?**
   - **Yes**: Use Public Client with DPoP and short token lifetime
   - **No**: Continue to step 2

2. **Do you want more secure token storage?**
   - **Yes**: Use Browser Client (HTTP-only cookies prevent JavaScript access)
   - **No**: Continue to step 3

3. **Do you share code with a mobile application?**
   - **Yes**: Use Public Client with DPoP (consistent across platforms)
   - **No**: Use Browser Client

## Summary

Both Public and Browser clients can be used securely for SPAs, but they have different trade-offs:

**Public Client with DPoP** requires additional configuration (DPoP required, short token lifetime) but provides cross-browser compatibility including Safari. The refresh token rotation enabled by default adds another layer of security.

**Browser Client** offers stronger built-in security through HTTP-only cookies but does not work in Safari due to ITP restrictions. Choose this option when Safari support is not required.

## Related Resources

- [Create an OAuth2 Client](/tutorials/setup-auth/login/create-oauth2-client) - Step-by-step tutorial for configuring OAuth2 clients
- [Log in to your app](/guides/auth/app-login) - Understanding OAuth2 client configuration and login flows
- [Auth Service Overview](/guides/auth/overview) - Comprehensive guide to the Auth service
