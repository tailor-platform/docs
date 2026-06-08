# IP Restriction

IP restriction lets you define an IP allowlist that controls which client IPs can reach your resources.
Requests whose client IP does not match the configured CIDR blocks are rejected at the routing layer, before they reach any application.

You can apply IP restriction at three levels, matching the [account hierarchy](account-management) (Organization → Folder → Workspace, with applications running inside workspaces):

- **Organization** — applies to every workspace in the organization.
- **Folder** — applies to every workspace in a folder.
- **Application** — applies to a single application.

Organization- and folder-level restrictions are managed through the [Tailor Platform Terraform provider](https://registry.terraform.io/providers/tailor-platform/tailor/latest) (version `>= 2.16.0`). Application-level restriction is configured in the [application manifest](/guides/application).

## How the layers combine

When more than one layer is configured, a request must satisfy **all** of them — the layers compose with **AND**. For example, if both an organization-level and a folder-level rule exist, the client IP must match both allowlists to reach a workspace in that folder. A layer with no rule configured imposes no restriction at that level.

## Organization level

Use [`tailor_organization_ip_restriction`](https://registry.terraform.io/providers/tailor-platform/tailor/latest/docs/resources/organization_ip_restriction) to apply an allowlist across every workspace in the organization.

```hcl {{ label: "organization_ip_restriction.tf" }}
resource "tailor_organization_ip_restriction" "this" {
  organization_id = "<organization_id>"
  allowed_ip_addresses = [
    "203.0.113.10/32", # a single public IP
    "198.51.100.0/24", # a public subnet range
  ]
}
```

| Argument               | Type           | Description                                                                                                                                                       |
| ---------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `organization_id`      | String         | The ID of the organization. Changing this forces replacement of the resource. **(required)**                                                                      |
| `allowed_ip_addresses` | List of String | List of allowed IPv4/IPv6 addresses or CIDR blocks. Each entry must be a **public** address; private, loopback, and multicast ranges are rejected. **(required)** |

## Folder level

Use [`tailor_organization_folder_ip_restriction`](https://registry.terraform.io/providers/tailor-platform/tailor/latest/docs/resources/organization_folder_ip_restriction) to apply an allowlist to every workspace in a [folder](account-management#folders). This composes with any organization-level rule (AND).

```hcl {{ label: "organization_folder_ip_restriction.tf" }}
resource "tailor_organization_folder_ip_restriction" "this" {
  organization_id = "<organization_id>"
  folder_id       = "<folder_id>"
  allowed_ip_addresses = [
    "203.0.113.10/32",
    "198.51.100.0/24",
  ]
}
```

| Argument               | Type           | Description                                                                                                                                                       |
| ---------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `organization_id`      | String         | The ID of the organization that owns the folder. Changing this forces replacement of the resource. **(required)**                                                 |
| `folder_id`            | String         | The ID of the folder. Changing this forces replacement of the resource. **(required)**                                                                            |
| `allowed_ip_addresses` | List of String | List of allowed IPv4/IPv6 addresses or CIDR blocks. Each entry must be a **public** address; private, loopback, and multicast ranges are rejected. **(required)** |

## Application level

To restrict access to a single application, set [`AllowedIPAddresses`](/guides/application) in the application manifest. This applies on top of any organization- and folder-level rules.

## Provider configuration

The organization- and folder-level resources require the Tailor Platform Terraform provider:

```hcl {{ label: "provider.tf" }}
terraform {
  required_providers {
    tailor = {
      source  = "tailor-platform/tailor"
      version = ">= 2.16.0"
    }
  }
}

provider "tailor" {}
```
