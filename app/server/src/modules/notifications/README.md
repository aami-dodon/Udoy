# Notifications Module

The notifications module exposes a centralized API for managing notification
templates and dispatching multi-channel alerts across the platform. It supports
role-aware template resolution, locale fallbacks, delivery preference checks,
and structured delivery logs for compliance.

## Routes

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/notifications/templates` | GET | List available templates with optional filtering by event key, channel, or locale. |
| `/api/notifications/templates` | POST | Create a new template for a specific channel and locale. |
| `/api/notifications/templates/:templateId` | GET | Retrieve a single template. |
| `/api/notifications/templates/:templateId` | PUT | Update the template content, metadata, or activation status. |
| `/api/notifications/templates/:templateId` | DELETE | Archive a template so it no longer resolves for dispatch. |
| `/api/notifications/dispatch` | POST | Dispatch a notification to one or more recipients with automatic preference checks. |
| `/api/notifications` | GET | Search historical notifications with optional filters for status, channel, event key, or user. |
| `/api/notifications/:notificationId` | GET | Retrieve a notification and its delivery attempt logs. |

## Dispatch Flow

1. A dispatch request specifies an `eventKey`, recipients, desired channels, and
   optional metadata.
2. The service resolves the recipient's locale and roles to select the most
   appropriate template (with fallbacks to language-only and default variants).
3. User notification preferences from the profile module determine which
   channels are eligible unless the caller forces delivery.
4. For email notifications the rendered body is wrapped in the shared Udoy
   branding shell before being sent via the Nodemailer integration.
5. A persistent record is created for each channel, attempt counters are
   maintained, and structured logs capture both success and failure metadata.

## Permissions

All routes are protected by the `notification` resource in RBAC:

- `notification:manage` – required for template CRUD and log access.
- `notification:dispatch` – required to invoke the dispatch endpoint.

The admin role is seeded with both permissions in the default policy.
