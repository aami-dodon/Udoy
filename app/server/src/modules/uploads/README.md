# Uploads Module

This module centralises MinIO presigned URL generation so clients can upload or
retrieve assets without handling MinIO credentials directly.

## Route → [`uploads.routes.js`](./uploads.routes.js)

- `POST /api/uploads/presign`
  - Requires [`authenticate`](../../middlewares/authenticate.js) and
    [`authorize`](../../middlewares/authorize.js).
  - Maps the requested operation to an RBAC action: `get` → `read`, everything
    else → `write`.
  - OpenAPI annotations describe both the success response and the error cases
    (`400`, `401`, `403`, `503`).

## Controller → [`uploads.controller.js`](./uploads.controller.js)

- `createPresignedUrl`
  - Sanitises `objectKey` values to prevent path traversal and rejects falsy
    keys.
  - Normalises the desired operation (`put` vs `get`), optional expiry, content
    type, and response headers before invoking the MinIO integration helpers
    (`getPresignedPutUrl`, `getPresignedGetUrl`).
  - Derives an ISO timestamp for the expiry and includes the public object URL
    (when available) in the response payload.
  - Converts configuration issues thrown as `MinioConfigError` into `503`
    responses so clients know MinIO is unavailable.

Build on this module for more advanced flows (multi-part uploads, revocation)
while keeping the presign logic consolidated here.
