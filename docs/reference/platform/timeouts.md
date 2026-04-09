# Timeouts

This page documents the various timeout limits in the Tailor Platform services. Understanding these timeouts is essential for building robust applications that can handle potential delays or failures gracefully.

## Overview

Timeouts are enforced across different services in the Tailor Platform to ensure system stability, resource management, and prevent indefinite blocking of resources.
Each service has specific timeout values based on its intended use case and operational requirements.

## Service Timeouts

| Service          | Timeout Value | Description                                                                   | Impact                                                                 |
| ---------------- | ------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Gateway Timeout  | 60 seconds    | Max time for API gateway request processing                                   | Request terminated if it exceeds 60s                                   |
| Pipeline Service | 60 seconds    | Max time for pipeline resolver execution                                      | Pipeline operation terminated if it exceeds 60s                        |
| Executor Service | 60 seconds    | Max time for `TargetTailorGraphql` and `TargetWebhook` operations to complete | Failure triggers retry (up to 10 attempts) if it exceeds 60s           |
| TailorDB Hooks   | 2 seconds     | Max time for TailorDB's `PreHook` and `PostHook` operations                   | Hook is terminated and returns an error if it exceeds 2s               |
| Pipeline Hooks   | 2 seconds     | Max time for Pipeline's `PreHook` and `PostHook` operations                   | Hook is terminated and returns an error if it exceeds 2s               |
| Function Service | 60 seconds    | Max time for a Function service operation                                     | Execution is terminated and returns an error if it exceeds 60s         |
| JobFunction      | 24 hours      | Max time for a JobFunction to complete its execution                          | Job function is terminated and returns an error if it exceeds 24 hours |

## Best Practices

When working with services that have timeout constraints, consider the following best practices:

1. **Design for timeouts**: Anticipate timeouts and handle them gracefully.

1. **Implement retry mechanisms**: For operations that might occasionally exceed timeout limits, implement appropriate retry logic with exponential backoff.

1. **Simplify operations**: Break down long tasks into smaller steps to avoid timeouts.

1. **Choose suitable services**: Use services like JobFunction for long-running tasks.

1. **Monitor performance**: Track operation performance to detect timeout risks early.

1. **Optimize queries**: Ensure database queries complete within timeout limits, especially for hooks that have stricter timeout constraints.

1. **Cache frequently accessed data**: Cache frequently accessed data to reduce processing time.
