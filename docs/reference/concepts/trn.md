# Tailor Resource Name (TRN)

This page documents the Tailor Resource Name (TRN) format, which uniquely identifies resources within a Workspace in the Tailor Platform.

## Overview

A TRN (Tailor Resource Name) is a standardized identifier format used to uniquely reference resources across the Tailor Platform. TRNs provide a consistent way to identify and reference various platform resources such as TailorDB instances, Pipeline resolvers, Auth configurations, and more.

## TRN Format

The TRN format follows a hierarchical structure with colon-separated components:

```
trn:v1:workspace:<workspace_id>:<resource_type>:<resource_name>[:<sub_resource_type>:<sub_resource_name>]...
```

### Components

| Component             | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| `trn`                 | Fixed prefix indicating this is a Tailor Resource Name          |
| `v1`                  | Version identifier for the TRN format                           |
| `workspace`           | Fixed identifier indicating the resource belongs to a workspace |
| `<workspace_id>`      | UUID of the workspace containing the resource                   |
| `<resource_type>`     | Type of the resource (e.g., `tailordb`, `pipeline`, `auth`)     |
| `<resource_name>`     | Name or identifier of the specific resource                     |
| `<sub_resource_type>` | Optional sub-resource type for nested resources                 |
| `<sub_resource_name>` | Optional name of the sub-resource                               |

## Supported Resource Types

The following table lists all supported resource types and their TRN formats:

### Workspace

| Resource Type | TRN Format                        | Description          |
| ------------- | --------------------------------- | -------------------- |
| Workspace     | `trn:v1:workspace:<workspace_id>` | The workspace itself |

### Application

| Resource Type | TRN Format                                               | Description                         |
| ------------- | -------------------------------------------------------- | ----------------------------------- |
| Application   | `trn:v1:workspace:<workspace_id>:application:<app_name>` | An application within the workspace |

### TailorDB

| Resource Type           | TRN Format                                                                             | Description                                 |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------- |
| TailorDB                | `trn:v1:workspace:<workspace_id>:tailordb:<namespace>`                                 | A TailorDB namespace                        |
| TailorDB Type           | `trn:v1:workspace:<workspace_id>:tailordb:<namespace>:type:<type_name>`                | A Type within a TailorDB namespace          |
| TailorDB GQL Permission | `trn:v1:workspace:<workspace_id>:tailordb:<namespace>:type:<type_name>:gql_permission` | GraphQL permission configuration for a Type |

### Pipeline

| Resource Type     | TRN Format                                                                          | Description                  |
| ----------------- | ----------------------------------------------------------------------------------- | ---------------------------- |
| Pipeline          | `trn:v1:workspace:<workspace_id>:pipeline:<pipeline_name>`                          | A Pipeline service instance  |
| Pipeline Resolver | `trn:v1:workspace:<workspace_id>:pipeline:<pipeline_name>:resolver:<resolver_name>` | A resolver within a Pipeline |

### Auth

| Resource Type | TRN Format                                                                       | Description                                          |
| ------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Auth          | `trn:v1:workspace:<workspace_id>:auth:<auth_name>`                               | An Auth service instance                             |
| Machine User  | `trn:v1:workspace:<workspace_id>:auth:<auth_name>:machine_user:<user_name>`      | A machine user for service-to-service authentication |
| OAuth2 Client | `trn:v1:workspace:<workspace_id>:auth:<auth_name>:oauth2_client:<client_name>`   | An OAuth2 client configuration                       |
| SCIM Config   | `trn:v1:workspace:<workspace_id>:auth:<auth_name>:scim_config`                   | SCIM provisioning configuration                      |
| SCIM Resource | `trn:v1:workspace:<workspace_id>:auth:<auth_name>:scim_resource:<resource_name>` | A SCIM resource                                      |
| User Profile  | `trn:v1:workspace:<workspace_id>:auth:<auth_name>:user_profile`                  | User profile configuration                           |
| IdP Config    | `trn:v1:workspace:<workspace_id>:auth:<auth_name>:idp_config:<config_name>`      | Identity Provider configuration                      |

### IdP

| Resource Type | TRN Format                                                            | Description                           |
| ------------- | --------------------------------------------------------------------- | ------------------------------------- |
| IdP           | `trn:v1:workspace:<workspace_id>:idp:<idp_name>`                      | A Built-in Identity Provider instance |
| IdP Client    | `trn:v1:workspace:<workspace_id>:idp:<idp_name>:client:<client_name>` | A client within the Built-in IdP      |

### Vault

| Resource Type | TRN Format                                                                | Description                       |
| ------------- | ------------------------------------------------------------------------- | --------------------------------- |
| Vault         | `trn:v1:workspace:<workspace_id>:vault:<vault_name>`                      | A Vault (Secret Manager) instance |
| Vault Secret  | `trn:v1:workspace:<workspace_id>:vault:<vault_name>:secret:<secret_name>` | A secret within a Vault           |

### Executor

| Resource Type | TRN Format                                                 | Description                  |
| ------------- | ---------------------------------------------------------- | ---------------------------- |
| Executor      | `trn:v1:workspace:<workspace_id>:executor:<executor_name>` | An Executor service instance |

### Workflow

| Resource Type         | TRN Format                                                              | Description                      |
| --------------------- | ----------------------------------------------------------------------- | -------------------------------- |
| Workflow              | `trn:v1:workspace:<workspace_id>:workflow:<workflow_name>`              | A Workflow definition            |
| Workflow Job Function | `trn:v1:workspace:<workspace_id>:workflow_job_function:<function_name>` | A job function used in workflows |

### StateFlow

| Resource Type | TRN Format                                                   | Description                         |
| ------------- | ------------------------------------------------------------ | ----------------------------------- |
| StateFlow     | `trn:v1:workspace:<workspace_id>:stateflow:<stateflow_name>` | A StateFlow definition (deprecated) |

### Static Website

| Resource Type  | TRN Format                                                                            | Description                            |
| -------------- | ------------------------------------------------------------------------------------- | -------------------------------------- |
| Static Website | `trn:v1:workspace:<workspace_id>:staticwebsite:<website_name>`                        | A static website hosting configuration |
| Custom Domain  | `trn:v1:workspace:<workspace_id>:staticwebsite:<website_name>:custom_domain:<domain>` | A custom domain for a static website   |

## Examples

### TailorDB TRN

```
trn:v1:workspace:17838a28-8563-4b79-8305-7df3ba730af6:tailordb:my-namespace
```

This TRN identifies a TailorDB namespace called `my-namespace` in the workspace with ID `17838a28-8563-4b79-8305-7df3ba730af6`.

### TailorDB Type TRN

```
trn:v1:workspace:17838a28-8563-4b79-8305-7df3ba730af6:tailordb:my-namespace:type:User
```

This TRN identifies a Type called `User` within the `my-namespace` TailorDB namespace.

### Pipeline Resolver TRN

```
trn:v1:workspace:17838a28-8563-4b79-8305-7df3ba730af6:pipeline:my-pipeline:resolver:createUser
```

This TRN identifies a resolver called `createUser` within the `my-pipeline` Pipeline.

### Vault Secret TRN

```
trn:v1:workspace:6085f287-9d47-4671-a530-d03c423c32bf:vault:my-vault:secret:api-key
```

This TRN identifies a secret called `api-key` within the `my-vault` Vault.

### OAuth2 Client TRN

```
trn:v1:workspace:17838a28-8563-4b79-8305-7df3ba730af6:auth:my-auth:oauth2_client:web-app
```

This TRN identifies an OAuth2 client called `web-app` within the `my-auth` Auth service.

### Workflow TRN

```
trn:v1:workspace:17838a28-8563-4b79-8305-7df3ba730af6:workflow:order-processing
```

This TRN identifies a Workflow called `order-processing`.
