# Interacting with Tailor Platform GraphQL

If you're already familiar with the GraphQL, you can skip this page and
proceed to the [Tutorials](/tutorials/manage-data-schema/overview)

This page demonstrates how to use the Tailor Platform GraphQL API. Along the way, you'll learn key concepts and techniques that are fundamental to using the Tailor Platform GraphQL.

## GraphQL

GraphQL is a powerful query language for APIs that allows clients to request exactly the data they need. This guide will introduce you to the basics of GraphQL, starting with queries and including sample code.

## Queries

In GraphQL, queries are used to request data from the server.
They are similar to making a GET request in REST APIs. With GraphQL, you can specify exactly which fields you want to receive in the response, giving you more control over the returned data and reducing the amount of unnecessary data transfer.

### Query Example

Let's assume we have an API for an e-commerce platform that has a `Product` type with fields like `id`, `name`, and `price`.
Assume that the `name` field is of the `String` data type and the `price` field is of the `Integer` data type.
Here's an example of a GraphQL query to request a list of products and their details:

```graphql {{ title: 'graphql' }}
query {
  products {
    edges {
      node {
        id
        name
        price
      }
    }
  }
}
```

In this query, we are asking for a list of products and their `id`, `name`, and `price` fields. The server will respond with a JSON object containing the requested data:

```json {{ title: 'example result'}}
{
  "data": {
    "products": {
      "edges": [
        {
          "node": {
            "id": "5223c635-557e-42b5-817a-138192923495",
            "name": "Product A",
            "price": 20
          }
        },
        {
          "node": {
            "id": "1935b56d-4fb6-4b7f-8e8a-8817c783b613",
            "name": "Product B",
            "price": 30
          }
        }
      ]
    }
  }
}
```

You might notice that the name of the query: `products` is plural of the type name.
In Tailor Platform, `<type name>s` (in plural) will give you a list of the records in the `<type name>`.

`edges` contains an array of results.

Unlike REST API, you are not constrained by the pre-determined API specification.

---

## Nested Objects

In GraphQL, you can request data from related objects or entities in a single query. This is called a "nested object" query. Nested objects allow you to fetch data from multiple related entities efficiently, without making multiple requests like you would with REST APIs.

### Nested Object Example

Continuing with our e-commerce platform example, let's assume that the `Product` type has a related `Manufacturer` type with fields like `id`, `name`, `country`, and `directShipping`. You can request data from both the `Product` and the related `Manufacturer` in a single query.

Here's an example of a GraphQL query requesting a list of products, their details, and the associated manufacturer information:

```graphql {{ title: 'graphql'}}
query {
  products {
    edges {
      node {
        id
        name
        price
        manufacturer {
          id
          name
          country
          directShipping
        }
      }
    }
  }
}
```

In this query, we are asking for a list of products along with their `id`, `name`, `price`, and related `manufacturer` data. The server will respond with a JSON object containing the requested data:

```json {{ title: 'example result'}}
{
  "data": {
    "products": {
      "edges": [
        {
          "node": {
          	"id": "5223c635-557e-42b5-817a-138192923495",
            "name": "Product A",
            "price": 20,
            "manufacturer" {
              "id": "6a5e6f81-15fd-493a-b5d5-86a80a8f81db",
              "name": "ABC Corp.",
              "country": "United States",
              "directShipping": false
            }
          }
        },
        {
          "node": {
          	"id": "1935b56d-4fb6-4b7f-8e8a-8817c783b613",
            "name": "Product B",
            "price": 30,
            "manufacturer" {
              "id": "38bfe29c-329c-4f6c-9e3e-5c1e6e8f0c0f",
              "name": "Wasabi Co.",
              "country": "Japan",
              "directShipping": false
              }
          }
        }
      ]
    }
  }
}
```

---

## Mutations

In GraphQL, mutations are used to create, update, or delete data on the server.
They are similar to POST, PUT, and DELETE requests in REST APIs.
Mutations allow you to perform actions on your data, such as creating new objects, updating existing ones, or removing objects altogether.

### Mutation Example

Continuing with our e-commerce platform example, let's assume we want to create, update, and delete `Product` objects.
Here are examples of GraphQL mutations for each of these operations:

#### Create a new Product

```graphql {{ title: 'graphql'}}
# Create "Product C" and set the manufacturer "ABC Corp." with the id in the Manufacturer type
mutation {
  createProduct(
    input: { name: "Product C", price: 40, manufacturerId: "6a5e6f81-15fd-493a-b5d5-86a80a8f81db" }
  ) {
    id
    name
    price
    manufacturer {
      id
      name
    }
  }
}
```

#### Update an existing Product

```graphql {{ title: 'graphql'}}
mutation {
  updateProduct(
    id: "5223c635-557e-42b5-817a-138192923495"
    input: { name: "Product A Updated", price: 25 }
  ) {
    id
    name
    price
  }
}
```

#### Delete a Product

```graphql {{ title: 'graphql'}}
# Delete "Product B"
mutation {
  deleteProduct(id: "5223c635-557e-42b5-817a-138192923495") {
    id
  }
}
```

In these mutation examples, we perform various actions on `Product` objects.
The `createProduct` mutation creates a new product, while the `updateProduct` mutation updates an existing product's information.
The `deleteProduct` mutation removes a product based on the provided `id`.
After executing each mutation, the server will respond with the affected data, such as the `id`, `name`, and `price` of the created or updated product, or the `id` of the deleted product.

## Filtering and Sorting

In GraphQL, you can apply filters and sorting options to your queries to retrieve specific data subsets or to organize the returned data based on certain criteria.
This allows you to efficiently request data that matches specific conditions or to display data in a particular order.

### Filter and Sort Example

Continuing with our e-commerce platform example, let's say we want to filter products based on their price and sort the results by price in ascending order.
Here are examples of GraphQL queries that demonstrate filtering and sorting:

#### Filter products by price

```graphql {{ title: 'graphql'}}
# Get the number of products that are priced greater than or equal to 30 and list them.
query {
  products(query: { price: { gte: 30 } }) {
    edges {
      node {
        id
        name
        price
      }
    }
  }
}
```

In this query, we request a count of products with a `price` greater than or equal to 30, along with a list of those products in the `edges` field. The`query` parameter specifies the filtering condition.

#### Sort products by price in ascending order

```graphql {{ title: 'graphql'}}
query {
  products(order: [{ field: price, direction: Asc }]) {
    edges {
      node {
        id
        name
        price
      }
    }
  }
}
```

In this query, we are requesting a list of products sorted by `price` in ascending order.
The `order` parameter takes an array of the sorting field and direction and is used to specify the ordering condition.

By applying filters and sorting options to your GraphQL queries, you can easily customize the data you receive from the server, making it more relevant to your specific use case and simplifying the data processing on the client-side.

#### Combining Filters and Sorting

You can also combine filtering and sorting in a single query to further refine your results.
For example, you can retrieve products with a price greater than or equal to 30, sorted by price in ascending order:

```graphql {{ title: 'graphql'}}
query {
  products(query: { price: { gte: 30 } }, order: [{ field: price, direction: Asc }]) {
    edges {
      node {
        id
        name
        price
      }
    }
  }
}
```

In this query, we apply both a filter and a sorting option to the products query. The resulting data will be a list of products that meet the filtering condition and are sorted according to the specified criteria.

By combining filters and sorting options in your GraphQL queries, you can retrieve data that is both relevant to your application and organized in a way that meets your specific needs. This flexibility allows you to tailor your queries to your requirements and optimize data retrieval and processing.

You can also use AND, OR, NOT and nested queries. Find more about operators and nested filtering condition in [TailorDB](/guides/tailordb/overview).

## Pagination

Pagination is an important feature in GraphQL that allows you to request a specific portion of a dataset. This is particularly useful when dealing with large datasets, as it enables you to efficiently retrieve and display smaller chunks of data, reducing the amount of data transferred and processed at once.

### Pagination Example

Continuing with our e-commerce platform example, let's assume we want to retrieve a list of products but limit the results to only 5 items per request. We can achieve this using the `first` and `after` parameters in our GraphQL query. Here's an example of how to implement pagination:

#### Fetch the first 5 products

```graphql {{ title: 'graphql'}}
query {
  products(first: 5) {
    edges {
      node {
        id
        name
        price
      }
    }
  }
}
```

In this query, we use the `first` parameter to limit the number of products returned to the first 5 items. This is useful for displaying a smaller set of data on the client-side, such as on the first page of a paginated list.

By using `first`, `last`, `after` and `before` parameters in your GraphQL queries, you can implement pagination in your application, allowing you to efficiently manage large datasets and improve the user experience by reducing the amount of data loaded and displayed at once.

Learn more about [pagination specification](/guides/tailordb/auto-generated-api#pagination).

## Aggregation Queries

Aggregation queries in GraphQL allow you to perform calculations on your data, such as counting, summing, averaging, finding the minimum or maximum values, and more. These queries are useful when you need to generate summary statistics or derive insights from your data.

### Aggregation Example

Continuing with our e-commerce platform example, let's say we want to calculate the average of the price of all products. We can achieve this using an aggregation query. Here's an example of how to implement an aggregation query for averaging the product prices:

#### Calculate the average price

```graphql {{ title: 'graphql'}}
query {
  aggregateProduct {
    average {
      price
    }
  }
}
```

In this query, we use the `aggregateProduct` query to perform an aggregation on the `price` field of the `Product` type. The `average` field is used to specify the aggregation operation, which in this case is calculating the average of all product prices.

Aggregation queries can also be combined with filtering to further customize the data you retrieve and perform calculations on specific subsets of your data.

### Calculate the total revenue per product

```graphql {{ title: 'graphql'}}
query {
  aggreagteOrder {
    sum {
      total
    }
    groupBy {
      productId
    }
  }
}
```

In this query, we use the `aggreagteOrder` query to perform an aggregation on the `Order` type. The `groupBy` syntax is used to group the orders by the `productId` field. For each group (each unique product), we calculate the sum of the `total` field, which represents the revenue for that specific product. We alias the result as `totalRevenue`.

The response will include a list of grouped results, where each group is identified by a unique `key` (the `productId` in this case), and the corresponding aggregated values, such as the total revenue for that specific product.

Using `groupBy` with aggregation queries in GraphQL allows you to perform calculations on your data while grouping it by a specific field, which can be helpful for generating summary statistics, comparisons, or insights based on different categories or attributes.

To use the aggregation query, you'll need to enable advanced APIs. For example, to enable aggregation on the `Order` type

```typescript
db.type("Order", {
  name: db.string(),
  // ... other fields
}).features({
  aggregation: true,
});
```

See [Advanced APIs](/guides/tailordb/advanced-settings/aggregation) page for more information.

## Further information

- Explore [Tutorials](/tutorials/manage-data-schema/overview) as you start building your application.
