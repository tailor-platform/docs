---
doc_type: guide
---

# Plural form for uncountable nouns

The `PluralForm` field accepts the plural form for an uncountable noun table in your TailorDB.
This setting is necessary to access individual records when the table name is an uncountable noun.

For example, to create table `userData` in the TailorDB, configure the `PluralForm` in the settings as the following:

```typescript
import { db } from "@tailor-platform/sdk";

export const userData = db
  .table("UserData", "User Data Model", {
    name: db.string().description("Name of the user"),
    ...db.fields.timestamps(),
  })
  .features({
    pluralForm: "UserDataList",
  });
export type userData = typeof userData;
```

The following query retrieves the list:

```graphql
query {
  UserDataList {
    edges {
      node {
        name
      }
    }
  }
}
```

Here is the query to retrieve individual records of the UserData table:

```graphql
query{
  userData(id:<userDataId>){
    name
  }
}
```
