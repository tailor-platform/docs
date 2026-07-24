---
doc_type: guide
---

# Debugging your function

When you write a function in Function service, you may encounter errors while running the function.
In this case, you can debug your code by checking the logs from your function.

## Example

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

  console.log(JSON.stringify(args)); // log the input args

  const variables = {
    pokemon: args.pokemon, // e.g., "rayquaza"
  };
  let res = await request("https://graphqlpokemon.favware.tech/v8", document, variables);
  console.log(JSON.stringify(res)); // log the response

  return { species: res.getFuzzyPokemon[0].species };
};
```

After deploying the function with [these steps](/guides/function/sending-request), you can view the function execution logs using the SDK CLI.

## Viewing Function Logs

Use the `tailor function logs` command to view function execution logs:

```bash {{ title: 'List all function logs' }}
tailor function logs
```

```bash {{ title: 'View specific execution logs' }}
tailor function logs <execution-id>
```

Example output:

```sh {{ title: 'output' }}
Execution ID: abc123-def456-ghi789
Status: SUCCESS
Started: 2025-02-14T07:16:31Z
Finished: 2025-02-14T07:16:32Z

Logs:
2025-02-14T07:16:31.590771150Z INFO {"pokemon":"ay"}
2025-02-14T07:16:32.467262922Z INFO {"getFuzzyPokemon":[{"species":"rayquaza"}]}

Result:
{"species":"rayquaza"}
```

**Options:**

- `--json` / `-j`: Output as JSON
- `--workspace-id` / `-w`: Specify workspace ID
- `--profile` / `-p`: Use workspace profile

For more details, see the [Function CLI Reference](/sdk/cli/function)
