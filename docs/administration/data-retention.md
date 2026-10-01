---
description: "Retention periods for job attempts, executions, resolver results and activity logs, and how to keep data the platform deletes after they expire."
---

# Data Retention

Tailor Platform automatically removes old data after specific retention periods to maintain system performance and optimize storage.
This document outlines the retention periods for different types of data in the platform.

## Retention Periods

Logs for the following data types are automatically removed after their respective retention periods:

| Data Type                  | Description                                                           | Retention Period |
| -------------------------- | --------------------------------------------------------------------- | ---------------- |
| Jobs and Attempts          | Background tasks and their execution attempts in the Executor service | 30 days          |
| Executions                 | Function service execution records                                    | 30 days          |
| Resolver Execution Results | Results of GraphQL resolver operations                                | 30 days          |
| Dataplane Events           | System events from the data plane                                     | 3 days           |
| Controlplane Activity Logs | Platform activity logs from the control plane                         | 90 days          |

After these retention periods expire, the data is permanently deleted from the system and cannot be recovered.

## Impact on Applications

When building applications on the Tailor Platform, be aware of these retention periods and design your data storage and retrieval strategies accordingly. For data that needs to be retained for longer periods, consider implementing custom archiving solutions or exporting the data to external storage systems before the retention period expires.
