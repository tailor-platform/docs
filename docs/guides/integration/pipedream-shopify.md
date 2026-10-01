---
title: "Shopify Integration with Zapier or Pipedream"
description: "Connect a SaaS app such as Shopify to Tailor Platform with Zapier or Pipedream: a trigger on new orders and an action that calls the GraphQL API."
doc_type: guide
---

# Integration Guides for Tailor Platform

If you already have a SaaS application and want to integrate it with Tailor Platform, you can use integration tools
like [Zapier](https://zapier.com/) or [Pipedream](https://pipedream.com/).
In this guide, we will explain how to integrate Tailor Platform with Shopify as an example of a SaaS application.

## Overview of Integration

When using integration tools, you need to create a trigger and an action. Triggers are events that occur in other SaaS applications, and actions are the subsequent steps, such as parsing data from triggers and sending API requests.

Assuming you have a Shopify store and you want to integrate it with Tailor Platform, a typical scenario would be to create a trigger when a new order is created in Shopify and forward this order data to Tailor Platform to manage orders or inventory.

Here's our integration demo with Shopify based on the scenario above:

<iframe src="https://www.youtube.com/embed/PbOu3oAXvJ0" frameBorder="0" title="Integration overview with Shopify" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />

## Details of Integration Settings

To integrate with Tailor Platform, you need to execute a login mutation to obtain an access token and use it for subsequent requests.\
Major integration tools like Zapier and Pipedream have features to execute JavaScript code in actions, so you can create a login mutation code in the action.

Pipedream is a bit more developer-friendly than Zapier, as executing JavaScript code is included in the free plan, and you can import npm packages.

Here's a video explaining the details of integration settings when using Pipedream:

<iframe src="https://www.youtube.com/embed/8DS7LR3vmp0" frameBorder="0" title="Configuration details of Pipedream" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
