---
tabs:
  pipeline-example:
    - label: Terraform
      content: |
        ```javascript
        post_hook = <<EOF
        (() => {
          // throws an error if no heroes found
          if (args.characters.edges.length < 0) {
            throw new TailorErrorMessage("No heroes found")
          }
          return {
            "success": true,
            "heroes": args.characters.edges.map((c) => ({
              "id": c.node.id,
              "name": c.node.name
            }))
          }
        })()
        EOF
        ```
    - label: CUE
      content: |
        ```javascript
        PostHook: common.#Script & {
            Expr: """
                (() => {
                    // throws an error if no heroes found
                    if (args.characters.edges.length < 0) {
                        throw new TailorErrorMessage("No heroes found")
                    }
                    return {
                        "success": true,
                        "heroes": args.characters.edges.map((c) => ({
                            "id": c.node.id,
                            "name": c.node.name
                        }))
                    }
                })()
            """
        }
        ```
  trigger-condition:
    - label: Terraform
      content: |
        ```javascript
        condition = <<EOF
          args.namespaceName == "my-tailordb" && args.typeName == "PurchaseOrder"
        EOF
        ```
    - label: CUE
      content: |
        ```javascript
        Condition: common.#Script & {
            Expr: """
                args.namespaceName == "my-tailordb" && args.typeName == "PurchaseOrder"
            """
        }
        ```
  trigger-variables:
    - label: Terraform
      content: |
        ```javascript
        variables = <<EOF
        ({
          "quantity": args.newRecord.quantity,
          "purchaseOrderID": args.newRecord.id,
          "putAwayDate": args.newRecord.purchaseOrderDate
        })
        EOF
        ```
    - label: CUE
      content: |
        ```javascript
        Variables: common.#Script & {
            Expr: """
                ({
                    input: {
                        "quantity": args.newRecord.quantity,
                        "purchaseOrderID": args.newRecord.id,
                        "putAwayDate": args.newRecord.purchaseOrderDate
                    }
                })"""
        }
        ```
  webhook-url:
    - label: Terraform
      content: |
        ```javascript
        url = <<EOF
          "https://hooks.slack.com/services/{service-name}/"
        EOF
        ```
    - label: CUE
      content: |
        ```javascript
        URL: common.#Script & {
            Expr: "\"https://hooks.slack.com/services/{service-name}/\""
        }
        ```
  webhook-body:
    - label: Terraform
      content: |
        ```javascript
        body = <<EOF
        ({
          "text": "New Product Registration :tada:",
          "blocks": [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "*New Product Registration* :tada: " + args.newRecord.name
              }
            }
          ]
        })
        EOF
        ```
    - label: CUE
      content: |
        ```javascript
        Body: common.#Script & {
            Expr: """
                ({
                    "text": "New Product Registration :tada:",
                    "blocks": [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "*New Product Registration* :tada: " + args.newRecord.name
                            }
                        }
                    ]
                })
            """
        }
        ```
  tailordb-hooks:
    - label: Terraform
      content: |
        ```javascript
        inactive = {
          type        = "boolean"
          description = "Field used to delete the record. Instead of deleting the record, we set this field to true. This is to keep the data integrity."
          hooks = {
            create = false
          }
        }
        ```
    - label: CUE
      content: |
        ```json
        Product: tailordb.#Type & {
        	Name:        "Product"
        	Description: "Product model"
        	Fields: {
        		...
        		inactive:{
        			Type:		tailordb.#TypeBool
        			Description: "Field used to delete the record. Instead of deleting the record, we set this field to true. This is to keep the data integrity."
        			Hooks: {
        				Create: common.#Script & {
        					Expr: "false"
        				}
        			}
        		}
        		...
        	}
        	...
        }
        ```
  tailordb-validate:
    - label: Terraform
      content: |
        ```javascript
        description = {
          type        = "string"
          description = "Description of the product."
          validate = [{
            script        = <<EOF
            ((value, data) => {
              console.log(value)
              console.log(value.length)
              console.log(data.name)
              console.log(Object.keys(user))
              Object.keys(user).forEach(function(key) {
                console.log(key, user[key], typeof user[key])
              })
              return !(value.length < 40)
            })(_value, _data)
            EOF
            action        = "deny"
            error_message = "Description length should be less than 40 characters."
          }]
        }
        ```
    - label: CUE
      content: |
        ```json
        Product: tailordb.#Type & {
        	Name:        "Product"
        	Description: "Product model"
        	Fields: {
        		description: {
        			Type:        tailordb.#TypeString
        			Description: "Description of the product."
        			Validate: [{
                        Script: common.#Script & {
                            Expr: """
                                ((value, data) => {
                                    console.log(value)
                                    console.log(value.length)
                                    console.log(data.name)
                                    console.log(Object.keys(user))
                                    Object.keys(user).forEach(function(key) {
        								console.log(key, user[key], typeof user[key])
        							})
                                    return !(value.length < 40)
                                })(_value, _data)
                            """
                        }
        				Action: tailordb.#Permit.Deny
        				ErrorMessage: "Description length should be less than 40 characters."
        			}]
        		}
        		...
        	}
        	...
        }
        ```
---

# JavaScript

Using JavaScript, implement robust validation logic, manipulate data structures, and perform efficient data transformations in Pipeline resolvers, Triggers and TailorDB.

Here are some examples of where you can utilize JavaScript:

- `PreHook`, `PostHook` blocks in [Pipeline resolvers](/guides/resolver)
- `Condition`, `URL`, `Body`, `Variables` blocks in [Triggers and Targets](/guides/executor/overview)
- `Validate` and `Hooks` blocks in [TailorDB](/guides/tailordb/overview)
- `create`, `update` hooks in [TailorDB Hooks](/guides/tailordb/hooks)
- `script` validation in [TailorDB Validations](/guides/tailordb/validations)

## Pipeline

You can use `PostHook` field in the Pipeline to return the object that can be used in the later steps.

Throwing a `TailorErrorMessage` in a pipeline step causes the pipeline execution to halt when the error is caught, and the API then returns the error message as the response.

**Example**:

:::tabs pipeline-example
:::

## Triggers and Targets

You can write Javascript to check the condition for event based triggers.

:::tabs trigger-condition
:::

In the target type `#TargetTailorGraphql`, you can pass the input variables to the Graphql query as shown below.

:::tabs trigger-variables
:::

You can write custom logic using JavaScript in the `URL` and `Body` fields in the target type `#TargetWebhook`.

:::tabs webhook-url
:::

:::tabs webhook-body
:::

## TailorDB

The example below demonstrates how to use JavaScript in `Hooks` to set a default value for the field. You can add custom logic to validate the input data and set default values.

:::tabs tailordb-hooks
:::

Here's an example on how you can leverage the built-in support for console messages in JavaScript to debug and troubleshoot your code.

:::tabs tailordb-validate
:::

Run the Tailor platform in your local environment to debug the application and view console messages in the log. Contact us if you need more information about running the platform locally.

The `Action` will be evaluated when the `Expr` returns true.

The `_value` and `_data` arguments to the function represent the `description` field and the input data object for the new record.

Additionally, you can access user object which contains information about the user who created or updated the record.

The user object has the following fields:

| Field          | Description                                                                         |
| -------------- | ----------------------------------------------------------------------------------- |
| `id`           | ID of the user.                                                                     |
| `type`         | Type of the user, e.g., `machine_user`.                                             |
| `workspace_id` | Current workspace ID.                                                               |
| `attributes`   | List of IDs; e.g., if the current user has admin rights, the admin ID will be here. |
| `tenant_id`    | Tenant ID.                                                                          |
