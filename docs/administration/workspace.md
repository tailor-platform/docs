# Workspace Administration

A [Workspace](/getting-started/core-concepts/workspace-application#workspace) is the top-level namespace in the Tailor Platform for your organization,
containing all applications, including each Tailor Platform service.
Since changing workspace settings affects all the applications within the workspace,
only [Platform users](#what-is-the-platform-user) have permission to manage workspaces.

You can use the interactive mode of `tailor` to view all the options available for workspace management by running the following command.

```bash
tailor workspace
  Commands:
  workspace app                   Manage workspace applications
  workspace create                Create a new Tailor Platform workspace.
  workspace delete                Delete a Tailor Platform workspace.
  workspace get                   Show detailed information about a workspace
  workspace list                  List all Tailor Platform workspaces.
  workspace restore               Restore a deleted workspace
  workspace user                  Manage workspace users
```

Platform users with an admin role can create a new workspace, manage workspace users, and delete the workspace.

By default, a maximum of 10 workspaces can be created per organization.

## What is the Platform user?

The Platform user is the user who can log in to Tailor Platform using the following command:

```bash
tailor login
```

When you sign up for an account, we create a Platform user with an admin role for you to manage your workspace. Please note that the [users you add to your application](/tutorials/setup-auth/login/create-user) are not Platform users and therefore cannot manage your workspace.\
To add a new Platform user, you can invite anyone with a Tailor Platform account to your workspace using the following command:

```bash
tailor workspace user invite --email $userEmailAddress --role $(admin|editor|viewer)
```

Depending on the role assigned, the Platform user will have different permissions to manage workspaces.

## Platform User Permissions

There are three roles for the Platform user: `admin`, `editor` and `viewer`.

### admin

The `admin` role can manage all workspace and application settings.

### editor

The `editor` role can manage all application settings but cannot manage workspace settings.\
However, `editor` users have read permission for the workspace settings they belong to.

### viewer

The `viewer` role can only view all application and workspace settings.

### Here's a list of permissions for each role:

| Permission                    | admin | editor | viewer |
| ----------------------------- | ----- | ------ | ------ |
| **Workspace**                 |       |        |        |
| Create a workspace            | ✅    |        |        |
| Describe a workspace          | ✅    | ✅     | ✅     |
| Delete a workspace            | ✅    |        |        |
| Restore a workspace           | ✅    |        |        |
| Invite users to a workspace   | ✅    |        |        |
| Remove users from a workspace | ✅    |        |        |
| Update platform user role     | ✅    |        |        |
| List workspaces               | ✅    | ✅     | ✅     |
| List services                 | ✅    | ✅     | ✅     |
| List machine users            | ✅    | ✅     |        |
| List platform users           | ✅    | ✅     | ✅     |
| Delete services               | ✅    |        |        |
| List oauth2 clients           | ✅    | ✅     |        |

## Deleting and restoring a workspace

Platform users with an `admin` role can destroy a workspace using the following command:

```bash
tailor workspace delete -w {WORKSPACE_ID}
```

If you need to restore a destroyed workspace, you can do so within 2 weeks of deletion using the following command:

```bash
tailor workspace restore -w {WORKSPACE_ID}
```

After 2 weeks, all data associated with the workspace will be permanently removed and cannot be recovered.
