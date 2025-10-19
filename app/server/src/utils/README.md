# Utility Modules

This directory houses reusable helpers that power authentication, logging, database access, and OpenAPI docs for the Express server.

## `jwt.js`

- Imports secrets from `../config/env.js` and the shared `logger` instance.
- Defines a `JwtError` class that carries HTTP status codes, machine-readable error codes, and the original failure as `cause`.
- Guards both access and refresh token secrets via `ensureSecret` before signing or verifying.
- Wraps [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken) to expose `signAccessToken`, `signRefreshToken`, `verifyAccessToken`, and `verifyRefreshToken`, logging at error/info levels that mirror the underlying failure (including token expiry).

## `logger.js`

Creates a singleton [Winston](https://github.com/winstonjs/winston) logger:

- Uses `combine(timestamp(), json())` for the base format so structured logs can be shipped to observability tools.
- Adds a colorful, timestamped console transport tailored for local development while production keeps JSON output only.

## `prismaClient.js`

Exports a single `PrismaClient` instance configured with environment-aware logging:

- In development the client records `query`, `error`, and `warn` events to aid debugging.
- In other environments it limits output to `error` events to avoid noisy logs and potential data exposure.

## `swagger/`

Swagger utilities live inside a directory because they are already modularized:

- `schemas.js` collects reusable component schemas such as `StandardSuccessResponse`, `ErrorResponse`, and MinIO presign payloads that route modules spread across the server can import.
- The folder structure leaves room for future additions (for example, shared path definitions or middleware factories) without overloading a single file.
