# Middlewares

This directory contains reusable Express middleware that enforce authentication, authorization, and error handling across the server.

## `authenticate.js`
- Reads the configured access and refresh cookie names from the environment (`env.jwt.access.cookieName` / `env.jwt.refresh.cookieName`).
- Extracts JWT access tokens from the `Authorization` header (`Bearer <token>`) or the configured access-token cookie.
- Falls back to refresh token validation when an access token is missing or invalid, reading from the `x-refresh-token` header or refresh cookie.
- On success, attaches the decoded payload to `req.user` and records token metadata (token type and raw token) in `req.auth` before delegating to downstream handlers.
- Responds with `401 Unauthorized` if neither access nor refresh tokens validate.

## `authorize.js`
- Throws during setup if either the `resource` or `action` option is omitted.
- Wraps Casbin RBAC checks to verify whether a subject can perform an action on a resource.
- Infers the subject from the authenticated user (role, email, or id) unless a custom `subjectExtractor` is provided.
- Accepts `resource` and `action` arguments that can be static values or request-based factories, resolving them per-request.
- Responds with `401 Unauthorized` when invoked without an authenticated user.
- Responds with `403 Forbidden` when required parameters resolve to falsy values or the Casbin policy denies access.

## `errorHandler.js`
- Centralized Express error handler that logs unexpected errors with stack traces.
- Uses `err.status` when available, defaulting to HTTP 500.
- Sends a JSON response with a standard `{ status: 'error', message }` payload.

These middlewares should be composed in route definitions to ensure consistent security enforcement and error reporting.
