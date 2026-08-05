# Outgoing IP Addresses

This page lists the outgoing IP addresses used by the Tailor Platform. If your infrastructure requires IP whitelisting for incoming connections from Tailor services, you can use these addresses to configure your firewall or security rules.

## Overview

The Tailor Platform operates across multiple regions to provide low-latency access and high availability. Each region has a set of dedicated outgoing IP addresses that are used when the platform makes external requests, such as webhook calls, API integrations, or other outbound connections.

## IP Addresses by Region

### Asia-Northeast

The following IP addresses are used for outgoing connections from the Asia-Northeast region:

| IP Address    |
| ------------- |
| 34.84.184.32  |
| 34.146.182.34 |
| 34.84.246.225 |
| 34.146.1.96   |
| 34.146.215.65 |

### US-West

The following IP addresses are used for outgoing connections from the US-West region:

| IP Address    |
| ------------- |
| 34.127.79.202 |
| 34.168.21.128 |
| 34.82.25.72   |

## When to Use These IPs

You may need to whitelist these IP addresses in the following scenarios:

- **Webhook endpoints**: If your application receives webhooks from Tailor Platform executors or event triggers, whitelist the IPs for the region where your workspace is hosted.
- **External API integrations**: When Tailor Platform functions or resolvers make requests to your external services that have IP-based access controls.
- **Database connections**: If you're using external databases that require IP whitelisting for incoming connections from Tailor services.

## Best Practices

When configuring IP whitelisting, consider the following recommendations:

1. **Whitelist all IPs for your region**: To ensure uninterrupted service, whitelist all IP addresses for the region where your Tailor workspace is deployed.

1. **Monitor for updates**: IP addresses may change over time. Check this documentation periodically or subscribe to platform updates to stay informed of any changes.

1. **Use region-specific whitelisting**: If your security policies allow, you can whitelist only the IPs for the specific region your workspace uses rather than all regions.
