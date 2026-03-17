---
preview: true
---

# Managing Built-in IdP Users <PreviewTag />

The Function service provides a built-in `tailor.idp` namespace that allows you to manage users in the Built-in IdP directly from your JavaScript functions. This enables programmatic user management operations such as creating, updating, deleting, and listing users without needing to make GraphQL calls.

## Overview

The `tailor.idp` namespace provides a `Client` class that you can use to interact with the Built-in IdP service. The client requires a namespace parameter that corresponds to your Built-in IdP service namespace.

:::tip
This feature requires a configured Built-in IdP service. For information on setting up Built-in IdP, see [Built-in IdP](/guides/auth/integration/built-in-idp).
:::

## Client Interface

The `tailor.idp.Client` class provides the following interface:

```ts
interface ClientConfig {
  namespace: string;
}

interface User {
  id: string;
  name: string;
  disabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserQuery {
  ids?: string[];
  names?: string[];
}

interface ListUsersOptions {
  first?: number;
  after?: string;
  query?: UserQuery;
}

interface ListUsersResponse {
  users: User[];
  nextPageToken: string | null;
  totalCount: number;
}

interface CreateUserInput {
  name: string;
  password?: string;
  disabled?: boolean;
}

interface UpdateUserInput {
  id: string;
  name?: string;
  password?: string;
  clearPassword?: boolean;
  disabled?: boolean;
}

interface SendPasswordResetEmailInput {
  userId: string;
  redirectUri: string;
}

class Client {
  constructor(config: ClientConfig);
  users(options?: ListUsersOptions): Promise<ListUsersResponse>;
  user(userId: string): Promise<User>;
  userByName(name: string): Promise<User>;
  createUser(input: CreateUserInput): Promise<User>;
  updateUser(input: UpdateUserInput): Promise<User>;
  deleteUser(userId: string): Promise<boolean>;
  sendPasswordResetEmail(input: SendPasswordResetEmailInput): Promise<boolean>;
}
```

## Creating a Client

To use the `tailor.idp` namespace, first create a client instance by specifying the namespace of your Built-in IdP service:

```js
const idpClient = new tailor.idp.Client({ namespace: "builtin-idp" });
```

## Client Methods

### List Users

The `users` method retrieves a list of users with optional pagination and filtering.

```js
export default async (args) => {
  const idpClient = new tailor.idp.Client({ namespace: args.namespaceName });

  // List first 10 users
  const result = await idpClient.users({
    first: 10,
  });

  return {
    users: result.users,
    totalCount: result.totalCount,
    hasNextPage: !!result.nextPageToken,
  };
};
```

You can also filter users by their IDs or names:

```js
export default async (args) => {
  const idpClient = new tailor.idp.Client({ namespace: args.namespaceName });

  // Filter users by names
  const result = await idpClient.users({
    query: {
      names: ["user1@example.com", "user2@example.com"],
    },
  });

  return {
    users: result.users,
    totalCount: result.totalCount,
  };
};
```

For pagination, use the `after` parameter with the `nextPageToken` from the previous response:

```js
export default async (args) => {
  const idpClient = new tailor.idp.Client({ namespace: args.namespaceName });

  // Get first page
  const firstPage = await idpClient.users({ first: 10 });

  // Get next page if available
  if (firstPage.nextPageToken) {
    const secondPage = await idpClient.users({
      first: 10,
      after: firstPage.nextPageToken,
    });
    return { users: secondPage.users };
  }

  return { users: firstPage.users };
};
```

### Get User

The `user` method retrieves a single user by their ID.

```js
export default async (args) => {
  const idpClient = new tailor.idp.Client({ namespace: args.namespaceName });

  const user = await idpClient.user(args.userId);

  return {
    id: user.id,
    name: user.name,
    disabled: user.disabled,
    createdAt: user.createdAt,
  };
};
```

### Get User by Name

The `userByName` method retrieves a single user by their name.

```js
export default async (args) => {
  const idpClient = new tailor.idp.Client({ namespace: args.namespaceName });

  const user = await idpClient.userByName(args.userName);

  return {
    id: user.id,
    name: user.name,
    disabled: user.disabled,
    createdAt: user.createdAt,
  };
};
```

### Create User

The `createUser` method creates a new user in the Built-in IdP. The `password` field is optional; if omitted, the user is created without a password and will not be able to log in until a password is set (e.g., via `sendPasswordResetEmail`).

```js
export default async (args) => {
  const idpClient = new tailor.idp.Client({ namespace: args.namespaceName });

  const newUser = await idpClient.createUser({
    name: args.email,
    password: args.password,
    disabled: false,
  });

  return {
    success: true,
    userId: newUser.id,
    userName: newUser.name,
  };
};
```

To create a user without a password:

```js
export default async (args) => {
  const idpClient = new tailor.idp.Client({ namespace: args.namespaceName });

  const newUser = await idpClient.createUser({
    name: args.email,
    disabled: false,
  });

  await idpClient.sendPasswordResetEmail({
    userId: newUser.id,
    redirectUri: "https://your-app.com/set-password",
  });

  return {
    success: true,
    userId: newUser.id,
    userName: newUser.name,
  };
};
```

### Update User

The `updateUser` method updates an existing user. You can update the user's name, password, disabled status, or clear the user's password using `clearPassword`.

:::warning
The `password` and `clearPassword` fields are mutually exclusive. Setting both at the same time will result in an error.
:::

```js
export default async (args) => {
  const idpClient = new tailor.idp.Client({ namespace: args.namespaceName });

  // Disable a user account
  const updatedUser = await idpClient.updateUser({
    id: args.userId,
    disabled: true,
  });

  return {
    success: true,
    userId: updatedUser.id,
    disabled: updatedUser.disabled,
  };
};
```

To clear a user's password (the user will not be able to log in until a new password is set):

```js
export default async (args) => {
  const idpClient = new tailor.idp.Client({ namespace: args.namespaceName });

  const updatedUser = await idpClient.updateUser({
    id: args.userId,
    clearPassword: true,
  });

  return {
    success: true,
    userId: updatedUser.id,
  };
};
```

### Delete User

The `deleteUser` method deletes a user by their ID.

```js
export default async (args) => {
  const idpClient = new tailor.idp.Client({ namespace: args.namespaceName });

  const success = await idpClient.deleteUser(args.userId);

  return {
    success: success,
  };
};
```

### Send Password Reset Email

The `sendPasswordResetEmail` method sends a password reset email to a user. This can be used for resetting existing users' passwords, setting initial passwords for users created without a password, or setting a new password after clearing a user's password with `clearPassword`.

```js
export default async (args) => {
  const idpClient = new tailor.idp.Client({ namespace: args.namespaceName });

  const success = await idpClient.sendPasswordResetEmail({
    userId: args.userId,
    redirectUri: "https://your-app.com/reset-password-complete",
  });

  return {
    success: success,
  };
};
```

:::tip
Password reset emails are sent from `no-reply@idp.erp.dev`. The `redirectUri` must be a valid absolute URL with `http` or `https` scheme.
:::

## Related Documentation

- [Built-in IdP](/guides/auth/integration/built-in-idp) - Learn how to configure the Built-in IdP service
- [Function Service Overview](/guides/function/overview) - Learn the basics of the Function service
- [Accessing TailorDB](/guides/function/accessing-tailordb) - Learn how to access TailorDB from functions
