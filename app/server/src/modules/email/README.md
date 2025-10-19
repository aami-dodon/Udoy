# Email Module

This module lets developers exercise the transactional email stack from the API.
It uses the shared Nodemailer-powered service to send either verification or
password-reset templates on demand.

## Route → [`email.routes.js`](./email.routes.js)

- `POST /api/email/test`
  - Requires [`authenticate`](../../middlewares/authenticate.js) and
    [`authorize`](../../middlewares/authorize.js).
  - The authorize middleware derives the action from the HTTP method (`POST`
    becomes `write`) while enforcing the `email:test` resource permission.
  - Annotated with OpenAPI comments so the request/response schemas surface in
    Swagger via `$ref` pointers to shared components.

## Controller → [`email.controller.js`](./email.controller.js)

- `sendTestEmail`
  - Accepts `{ to, type, name, template, textTemplate, variables }` in the body.
  - Normalizes `type` (`verification` vs `passwordReset`), `name`, and template
    variables, rejecting requests without a `to` address.
  - Generates a temporary token and delegates to
    [`sendVerificationEmail`](../../services/emailService.js) or
    [`sendPasswordResetEmail`](../../services/emailService.js).
  - Returns a success payload (`status: 'success'`) or propagates unexpected
    errors to the global error handler.

Extend this module as you add new transactional templates by validating input,
calling the relevant email service helper, and returning explicit status
messages.
