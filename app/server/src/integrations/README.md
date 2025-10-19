# Integrations Overview

This directory centralizes adapters that bridge the Udoy server with external systems. Each integration exposes a small, well-defined surface area so that the rest of the codebase can remain decoupled from third-party specifics.

## Available Integrations

| Integration | Purpose | Key Exports |
| --- | --- | --- |
| [Casbin](./casbin/README.md) | Role-based access control (RBAC) policy enforcement. | `getEnforcer()` loader, RBAC model (`model.conf`), default policy (`policy.csv`). |
| [Email](./email/README.md) | SMTP delivery via Nodemailer with connection verification and logging. | Default export `transporter` (`null` when SMTP config is missing). |
| [MinIO](./minio/README.md) | Object storage client and presigned URL utilities. | `minioClient`, configuration helpers, presigned URL generators. |

## Usage Guidelines

1. **Keep integrations stateless:** Wherever possible expose pure helper functions or initialized singletons that can be shared.
2. **Guard external dependencies:** Each adapter should gracefully handle missing configuration and fail with actionable log messages instead of crashing the app.
3. **Document behavior:** Update the integration-specific README whenever the contract or environment requirements change.
4. **Avoid direct imports elsewhere:** Route all external service usage through the adapters so the integration can be swapped or extended without sweeping changes.

Refer to the individual READMEs linked above for configuration details and usage snippets.
