---
description: "Obtain an access token for server-to-server calls by presenting an IdP ID token to the OAuth2 API (JWT Bearer grant)."
---

# Using ID Token

The ID Token Auth flow ([JWT Bearer Grant Type](https://datatracker.ietf.org/doc/html/rfc7523))enables OAuth 2.0 clients to obtain access tokens by presenting a signed JWT to the authorization server.\
This method is particularly useful for server-to-server communication, where user interaction is not feasible.

## Prerequisite

- Set up and register your IdP for ID tokens using the tutorials in [Setting up IdP for ID Token](/tutorials/setup-auth/setup-identity-provider) and [Register your IdP](/tutorials/setup-auth/register-identity-provider).

## 1. Get your ID token

Send the following request by replacing yourAuth0Domain, username, password, yourApiIdentifier, yourClientId and yourClientSecret to get the id_token.
Refer to [Setting up IdP for ID token](/tutorials/setup-auth/setup-identity-provider#3settingupidpforidtoken) to get your API identifier.

```
curl --request POST \
  --url 'https://{AUTH0_DOMAIN}.us.auth0.com}/oauth/token' \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data grant_type=password \
  --data 'username={USERNAME}' \
  --data 'password={PASSWORD}' \
  --data 'audience={API_IDENTIFIER}' \
  --data scope=openid \
  --data 'client_id={CLIENT_ID}' \
  --data 'client_secret={CLIENT_SECRET}'
```

Upon a successful request, you'll receive an HTTP 200 response with a payload containing access_token, refresh_token, id_token, token_type, and expires_in values:

```bash {{ title: "example response", id: "response-2" }}
{
  "access_token": "eyJz93a...k4laUWw",
  "refresh_token": "GEbRxBN...edjnXbL",
  "id_token": "eyJ0XAi...4faeEoQ",
  "token_type": "Bearer",
  "expires_in": 36000
}
```

## 2. Call your API

Send the following request to your API to get a response with an access token that can be used in the GraphQL playground to run queries.

```bash
curl -X POST https://{YOUR_APP_SUBDOMAIN}.erp.dev/oauth2/token \
    -F grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer \
    -F assertion={id_token}
```

```bash {{ title: "example response", id: "response-2" }}
{
    "access_token":"0wxc8b...DQxfFtx",
    "refresh_token":"khScdBQ...p6OmDoY",
    "expires_in":86400
}
```
