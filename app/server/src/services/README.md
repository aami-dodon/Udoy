# Services Overview

This directory currently exposes the server's email service. Each helper in this module wraps the shared Nodemailer transporter and uses the runtime configuration exported from `app/server/src/config/env.js`.

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
