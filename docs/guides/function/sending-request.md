---
doc_type: guide
---

# Sending requests from Function service

The Function service allows you to send HTTP requests to third-party applications.
This enables you to integrate with external services and retrieve data from them.

**Currently, sending requests from the Function service to your application on the Tailor Platform is not supported.**
**You can only send requests to external services.**

The one exception is [AI Gateway](/guides/ai-gateway), which functions can call directly — and without an `Authorization` header, since the platform authenticates those requests as the identity the function runs as. See [Calling from a Function](/guides/ai-gateway#calling-from-a-function).

In this guide, we will show you how to send an HTTP request from the Function service using npm packages.

## 1. Write your function and bundle it for deployment

When you use npm packages in Function service, you need to bundle your function with the packages.
In this guide, we use `esbuild` to bundle your function with npm packages but any bundlers can be used.

Assuming you have a function like below:

```js {{ title: 'get_pokemon_function.js' }}
import { gql, request } from "graphql-request";

globalThis.main = async function (args) {
  const document = gql`
    query ExampleQuery($pokemon: String!) {
      getFuzzyPokemon(pokemon: $pokemon) {
        species
      }
    }
  `;

  const variables = {
    pokemon: args.pokemon, // e.g., "rayquaza"
  };
  let res = await request("https://graphqlpokemon.favware.tech/v8", document, variables);

  return { species: res.getFuzzyPokemon[0].species };
};
```

You need to bundle the function with a bundler.
In this case, we use `esbuild` to bundle the function.

```sh
esbuild get_pokemon_function.js --bundle --minify --outfile=dist/get_pokemon_function.js
```

**caveat**: You have to setup package.json and install the packages before bundling the function.

Once you bundle the function, you can deploy it to Tailor Platform.

## 2. Deploy your function

### Directory Structure

Here's the sample directory structure for an SDK project.
In this example, we place the bundled function code in the `functions` directory.

```sh {{ title: 'SDK directory structure' }}
.
├── tailor.config.ts
├── package.json
├── functions
│   └── get_pokemon_function.js
├── resolvers
│   └── get-pokemon.ts
└── tailordb
    └── ...
```

#### Resolver Example

With SDK, the schema definition is inferred from the input/output types.
Here's a sample SDK configuration for setting up a resolver that sends HTTP requests:

```typescript {{ title: 'get-pokemon.ts' }}
import { createResolver, t } from "@tailor-platform/sdk";
import { gql, request } from "graphql-request";

export default createResolver({
  name: "getPokemon",
  description: "sample query resolver",
  operation: "query",
  input: {
    pokemon: t.string(),
  },
  body: async (context) => {
    const document = gql`
      query ExampleQuery($pokemon: String!) {
        getFuzzyPokemon(pokemon: $pokemon) {
          species
        }
      }
    `;

    const variables = {
      pokemon: context.input.pokemon,
    };

    const res = await request("https://graphqlpokemon.favware.tech/v8", document, variables);

    return { species: res.getFuzzyPokemon[0].species };
  },
  output: t.object({
    species: t.string().nullable(),
  }),
});
```

#### Deployment

Let's deploy the function to Tailor Platform.

```sh
npx tailor deploy
```

Once the deployment is complete, you can send a request to the function.
Navigate to your application's GraphQL playground at:

```
https://{APP_NAME}-{WORKSPACE_HASH}.erp.dev/query
```

Then, you can run the query in the playground

```graphql
query {
  getPokemon(input: { pokemon: "ray" }) {
    species
  }
}
```

you'll get the response like below:

```json
{
  "data": {
    "getPokemon": {
      "species": "rayquaza"
    }
  }
}
```
