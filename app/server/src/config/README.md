# Configuration Layer

This directory centralizes reusable configuration objects that the server imports at runtime. Each module isolates configuration for a major integration so that the rest of the codebase can depend on a single, validated source of truth drawn directly from the code in this folder.

## `env.js`

Loads environment variables via [`dotenv`](https://github.com/motdotla/dotenv) unless the current process is running tests (`process.env.NODE_ENV === 'test'`). When loading from disk it respects `process.env.ENV_FILE_PATH` and defaults to `.env`. The module parses and normalizes the following groups exactly as implemented in `env.js`:

- **Server runtime** – Captures `NODE_ENV`, coerces `SERVER_PORT` to a number with a `6005` fallback, and guarantees that `API_PREFIX` starts with `/`.
- **CORS** – Splits `CORS_ALLOWED_ORIGINS` on commas, trims whitespace, and drops empty entries.
- **MinIO storage** – Only emits a configuration object when `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, and `MINIO_SECRET_KEY` are all present. Optional properties—`MINIO_PORT`, `MINIO_REGION`, `MINIO_BUCKET`, `MINIO_PUBLIC_BASE_URL`, and the boolean `MINIO_FORCE_SIGNED_DOWNLOADS`—are attached after validating numeric ports and casting the `MINIO_USE_SSL` string to a boolean.
- **Email delivery** – Returns metadata (`EMAIL_FROM`, `EMAIL_VERIFICATION_URL`, `PASSWORD_RESET_URL`) and an SMTP block when `EMAIL_SMTP_HOST`, `EMAIL_SMTP_USER`, and `EMAIL_SMTP_PASS` exist. The SMTP block contains host, credentials, the optional numeric `EMAIL_SMTP_PORT`, and a boolean derived from `EMAIL_SMTP_SECURE`.
- **JWT tokens** – Groups access and refresh token settings (`JWT_*_SECRET`, `JWT_*_EXPIRES_IN`, `JWT_*_COOKIE_NAME`) into a nested object consumed by authentication code.

Across the configuration, numeric strings are coerced with `Number(...)` and checked with `Number.isNaN`, while boolean-like flags are normalized by lowercasing the original string and comparing it to `'true'`. Absent configurations are surfaced as `null` so downstream code can handle missing integrations explicitly.

## `swagger.js`

Generates the OpenAPI specification using `swagger-jsdoc` with metadata tailored to Udoy:

- Sets the API title (`Udoy API`), semantic version (`0.1.0`), and descriptive copy explaining that route documentation lives alongside each module.
- Points the `servers` array to the relative API prefix returned by `env.apiPrefix`, enabling deployments to relocate the API by adjusting environment variables only.
- Declares two security schemes: `bearerAuth` for JWT access tokens and `refreshToken` for the optional `x-refresh-token` header.
- Imports shared JSON schemas from `../utils/swagger/schemas.js` and scans `src/modules/**/*.routes.js` for JSDoc annotations.
- Exports both the raw spec (`swaggerSpec`) and UI configuration (`swaggerUiOptions`). The UI options enable the Swagger explorer, set a custom page title, and persist authorization credentials across page reloads.

By keeping configuration logic here, the rest of the server can remain declarative and only rely on the exported objects.
