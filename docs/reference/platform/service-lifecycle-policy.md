# Service Lifecycle Policy

Understand the full lifecycle of our services and how each stage affects your application.
These services form the core of your app's functionality, making their stability and evolution critical to building a reliable, scalable solution.

Each stage has a defined purpose, expected stability level, and specific implications for your integrations.
Our reference table provides clear tags and actionable guidance to help you plan ahead, avoid disruptions, and keep your application running smoothly as services progress.

## Definitions

### Preview

An early stage intended for rapid iteration and feedback collection. Features may change frequently, and reliability is not guaranteed.

### General Availability (GA)

The service is considered stable and production-ready, with published documentation.

### Maintenance

The service remains available but is no longer actively developed. Only critical bug fixes and security patches are applied.

### Deprecated

The service is scheduled for removal. Deprecation notices and migration options are provided, and the End-of-Support (EOS) timeline begins.

### End-of-Support (EOS)

The service is no longer supported but remains operational until the scheduled retirement date.

### Retired / Out-of-Service

The service is permanently shut down and its endpoints are disabled. Data is archived according to policy.

## Guidance

Each service is tagged to show its current lifecycle phase. These tags help you understand what to expect and how to engage with the service, as detailed in the table below. For the latest announcements and updates, check the [release notes](https://www.tailor.tech/resources?filter=release-notes).

| Stage                     | Tag                                 | What you need to do                                                |
| ------------------------- | ----------------------------------- | ------------------------------------------------------------------ |
| Preview                   | <Tag color="emerald">Preview</Tag>  | Use only in non-production environments                            |
| General Availability (GA) |                                     | Use in production environments                                     |
| Maintenance               | <Tag color="zinc">Maintenance</Tag> | Plan for migration if new functionality is needed in the future    |
| Deprecated                | <Tag color="amber">Deprecated</Tag> | Stop onboarding new systems and start migrating existing workloads |
| End-of-Support (EOS)      | <Tag color="rose">EOS</Tag>         | To maintain compliance, complete the migration before the EOS date |

## Current Service and Feature Status

The following table shows the current lifecycle stage for Tailor Platform services and features:

| Service/Feature                                                | Stage                               | Notes                                                      |
| -------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| **[AI Gateway](/guides/ai-gateway)**                           | <Tag color="emerald">Preview</Tag>  | Unified OpenAI-compatible endpoint for accessing LLMs      |
| **[Built-in IdP](/guides/auth/integration/built-in-idp)**      | <Tag color="emerald">Preview</Tag>  | Identity provider functionality for authentication         |
| **tailorctl manifest**                                         | <Tag color="zinc">Maintenance</Tag> | CUE-based manifest configuration for tailorctl             |
| **TailorDB Draft**                                             | <Tag color="amber">Deprecated</Tag> | Draft record functionality - use separate tables instead   |
| **[TailorDB Validate/hook using CEL](/guides/tailordb/hooks)** | <Tag color="amber">Deprecated</Tag> | CEL-based validation and hooks - migrate to JavaScript     |
| **TailorDB Type/Record Permissions (Legacy)**                  | <Tag color="amber">Deprecated</Tag> | Legacy permission system - use new permission model        |
| **StateFlow service**                                          | <Tag color="amber">Deprecated</Tag> | State management service - use built-in permissions or CDC |
