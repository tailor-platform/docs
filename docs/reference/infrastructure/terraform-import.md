---
description: "Import existing Tailor Platform resources into Terraform one at a time, or in bulk from a workspace export."
---

# Terraform Import

The Tailor Platform Terraform provider supports importing existing resources into your Terraform configuration, allowing you to bring resources that were created through the console or CLI.

## Importing a single resource

You can import a single existing resource by adding a resource configuration block to your Terraform files and then running the `terraform import` command.

### Example

Let's import an existing TailorDB Namespace into your Terraform configuration:

```hcl {{label: "tailordb_example.tf"}}
  resource "tailor_tailordb" "example" {
    id = "trn:v1:workspace:<workspace_id>:tailordb:<namespace>"
  }
```

Then run:

```bash
terraform import tailor_tailordb.example trn:v1:workspace:<workspace_id>:tailordb:<namespace>
```

After importing, run `terraform plan` to verify and adjust the configuration to match the imported state.

## Bulk Import existing workspace resources

You can also import all resources in a workspace by following these steps:

1. Export existing resources:

```bash
tailorctl workspace export --output {OUTPUT_DIRECTORY}
```

2. Create `{OUTPUT_DIRECTORY}/provider.tf`:

```hcl {{ label: "provider.tf"}}
terraform {
  required_providers {
    tailor = {
      source  = "tailor-platform/tailor"
      version = ">= 1.1.1"
    }
  }
}

provider "tailor" {}
```

3. Run `terraform plan` to generate and validate the imported resource configurations:

```bash
terraform plan -generate-config-out=imported_resources.tf
```

Review `imported_resources.tf` to ensure all resources are correctly imported.

## Incremental Importing

Incremental importing allows you to gradually bring resources to your workspace comparing and importing only the resources not already tracked in your current state.

1. Export current state to JSON:

```bash
terraform show -json > existing.json
```

2. Export only resources not in the existing state:

```bash
tailorctl workspace export --output {OUTPUT_DIRECTORY} --state existing.json
```

This will export the resources that are not in the `existing.json` file. Import the new resources using the Terraform import process.
