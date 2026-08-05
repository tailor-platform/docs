---
doc_type: guide
---

# Examples

These examples show how to use the Function service to run JavaScript as serverless functions on the Tailor Platform, deploy them, and trigger them via resolvers.

Here are the code [examples](https://github.com/tailor-platform/templates/tree/main/examples).

We use TypeScript in the examples.

<div class="cards-3">

<Card title="Insert Default Value" href="https://github.com/tailor-platform/templates/tree/main/examples/function-kysely-examples/insert-default-value" iconSize="sm">
  <template #icon>
    <GitHubIcon />
  </template>
  Learn how to use Kysely with TailorDB to insert records with default values, including using defaultValues() and SQL DEFAULT for specific columns.
</Card>

<Card title="Vector Search" href="https://github.com/tailor-platform/templates/tree/main/examples/function-kysely-examples/vector-search" iconSize="sm">
  <template #icon>
    <GitHubIcon />
  </template>
  Discover how to use Kysely with TailorDB's vector similarity search functionality to find records based on semantic similarity.
</Card>

<Card title="With pdfme" href="https://github.com/tailor-platform/templates/tree/main/examples/function-pdfme" iconSize="sm">
  <template #icon>
    <GitHubIcon />
  </template>
  A sample for executing pdfme in the Function service.
</Card>

<Card title="With Secret Manager" href="https://github.com/tailor-platform/templates/tree/main/examples/secretmanager" iconSize="sm">
  <template #icon>
    <GitHubIcon />
  </template>
  A sample for executing Secret Manager in the Function service.
</Card>

<Card title="With iconv" href="https://github.com/tailor-platform/templates/tree/main/examples/iconv" iconSize="sm">
  <template #icon>
    <GitHubIcon />
  </template>
  Learn how to use character encoding conversion with tailor.iconv APIs to encode, decode, and convert between different character encodings like UTF-8, Shift\_JIS, and ASCII.
</Card>

<Card title="TailorDB File Operations" href="https://github.com/tailor-platform/templates/tree/main/examples/function-tailordb-file" iconSize="sm">
  <template #icon>
    <GitHubIcon />
  </template>
  Learn how to use TailorDB File Type operations from functions, including uploading, downloading, streaming, and managing file metadata using the `tailordb.file` API.
</Card>

<Card title="With AuthConnection" href="https://github.com/tailor-platform/templates/tree/main/examples/authconnection" iconSize="sm">
  <template #icon>
    <GitHubIcon />
  </template>
  Learn how to use OAuth2 authentication connections to access external APIs like Google, Microsoft 365, and QuickBooks from your Functions.
</Card>

</div>
