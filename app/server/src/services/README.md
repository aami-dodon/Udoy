# Services Overview

This directory houses shared business logic for cross-cutting platform
capabilities such as email delivery and notifications. Each helper remains
decoupled from the HTTP layer so controllers can orchestrate behaviour without
duplicating integration code.

## Email Service (`emailService.js`)

Implements all outbound messaging related to account verification and password resets.

### Responsibilities

- Loads the Nodemailer transporter via `ensureTransporter()` and aborts if the integration is misconfigured.
- Validates required email fields (`to`, sender address, and at least one of `html` or `text`) before dispatching a message.
- Builds HTML and plain-text bodies from the default templates, performing `{{variable}}` substitution with `renderTemplate`.
- Generates verification and password reset links with `buildLink`, returning the configured base URL when no token is provided and `null` when no base URL exists.
- Logs successful deliveries and failures with the shared `logger` utility.

### Key Helpers

- `ensureTransporter()` – Returns the shared Nodemailer transporter created in `integrations/email/nodemailerClient.js`, throwing when unavailable.
- `renderTemplate(template, variables)` – Replaces `{{key}}` placeholders using the supplied variables object.
- `buildLink(baseUrl, token, tokenKey)` – Appends `tokenKey` (defaults to `token`) to `baseUrl`, falling back to manual query-string construction if the URL constructor rejects the input.

### Public API

- `sendEmail({ to, subject, html, text, from })`
  - Resolves the sender to `env.email.from`, defaults the subject to `"Udoy notification"`, and dispatches through the transporter.
- `sendVerificationEmail({ to, token, subject, template, textTemplate, variables })`
  - Builds verification content with `env.email.verificationUrl`, merges the provided `variables` with `{ name: 'there', verificationLink }`, and defers to `sendEmail`.
- `sendPasswordResetEmail({ to, token, subject, template, textTemplate, variables })`
  - Mirrors the verification flow but uses `env.email.passwordResetUrl` and populates `{ name: 'there', passwordResetLink }`.

### Configuration

Email delivery depends on the following values from `env.email` (see `config/env.js`):

- `from` – Default sender address (derived from `EMAIL_FROM`).
- `verificationUrl` – Base URL used by `sendVerificationEmail` (derived from `EMAIL_VERIFICATION_URL`).
- `passwordResetUrl` – Base URL used by `sendPasswordResetEmail` (derived from `PASSWORD_RESET_URL`).
- `smtp` – Transport configuration consumed by `nodemailerClient.js`:
  - `host` – From `EMAIL_SMTP_HOST`.
  - `port` – From `EMAIL_SMTP_PORT` when provided.
  - `secure` – From `EMAIL_SMTP_SECURE` (string comparison to `'true'`).
  - `auth.user` – From `EMAIL_SMTP_USER`.
  - `auth.pass` – From `EMAIL_SMTP_PASS`.

Populate these variables in `.env.local` when testing locally and mirror them in `.env.example` so other environments have the necessary configuration.

## Notification Template Service (`notificationTemplateService.js`)

Manages persistent notification templates used across channels and locales.

### Responsibilities

- Validates template input (name, event key, channel, locale, body, optional
  subject/preview) and normalises audience roles.
- Persists create/update/archive operations through Prisma while tracking the
  actor that performed the change.
- Resolves the best template for a dispatch request by evaluating locale
  fallbacks and the recipient's roles.

### Public API

- `createNotificationTemplate(payload, { actorId })`
- `updateNotificationTemplate(id, payload, { actorId })`
- `archiveNotificationTemplate(id, { actorId })`
- `listNotificationTemplates(filters)`
- `getNotificationTemplateById(id)`
- `resolveNotificationTemplate({ eventKey, channel, locale, roles })`

## Notification Service (`notificationService.js`)

Coordinates delivery of notifications across email and in-app channels with
logging, preference enforcement, and persistent delivery history.

### Responsibilities

- Loads recipient context (profile preferences, locale hints, roles) and applies
  opt-in rules unless forced.
- Resolves templates through the template service and renders them with shared
  placeholder substitution utilities.
- Wraps email payloads with the Udoy-branded HTML shell and dispatches via the
  existing Nodemailer adapter.
- Persists notification records, handles idempotency keys, and captures
  structured attempt logs for successful and failed deliveries.

### Public API

- `dispatchNotifications(request, { actorId })`
  - Accepts an event key, recipient list, optional schedule, and metadata; returns
    fulfilment results per recipient/channel.
- `listNotifications(filters)` – Fetches recent notification records for audit
  and debugging.
- `getNotificationById(id)` – Retrieves a notification with ordered delivery
  logs.
