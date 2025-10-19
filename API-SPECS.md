# API Specifications

## Overview
- **Base URL:** `${SERVER_URL}/api`
- **Default Content Type:** `application/json`
- **Authentication:** JWT access tokens sent as `Authorization: Bearer <token>` when required. A refresh token may also be supplied via the `x-refresh-token` header.
- **Notation:** All timestamps use ISO-8601 format in UTC.
- **Interactive Docs:** Swagger UI is available at `${SERVER_URL}/api/docs` with the raw schema at `${SERVER_URL}/api/docs/swagger.json`.

> The OpenAPI schema is sourced directly from the JSDoc annotations that live next to each module (for example, `app/server/src/modules/health/health.routes.js`).

## Endpoint Summary
| Method | Path                 | Description                                             | Auth |
| ------ | -------------------- | ------------------------------------------------------- | ---- |
| GET    | /api/health          | Returns service health, uptime, and dependency status. | No   |
| POST   | /api/auth/login      | Placeholder login endpoint.                            | No   |
| POST   | /api/auth/refresh    | Placeholder refresh endpoint requiring a valid token.  | Yes  |
| POST   | /api/uploads/presign | Generates a MinIO presigned URL for uploads/downloads. | Yes  |

## Endpoints

### GET /api/health
**Description:** Returns the current health of the service, including checks for Postgres connectivity, MinIO availability, and CORS configuration.

**Authentication:** Not required.

**Headers:**
- `Accept: application/json`

**Sample Request:**
```
GET /api/health HTTP/1.1
Host: ${SERVER_HOST}
Accept: application/json
```

**Success Response — 200 OK**
```json
{
  "status": "ok",
  "timestamp": "2025-10-19T01:35:45.123Z",
  "uptime": 5324.218,
  "checks": {
    "database": {
      "status": "up"
    },
    "minio": {
      "status": "up",
      "bucket": "udoy-dev-bucket"
    }
  },
  "cors": {
    "enabled": true,
    "allowedOrigins": [
      "http://localhost:6004"
    ],
    "allowCredentials": true
  }
}
```

**Error Response — 503 Service Unavailable**
```json
{
  "status": "error",
  "timestamp": "2025-10-19T01:35:45.123Z",
  "checks": {
    "database": {
      "status": "down",
      "message": "Database connection refused"
    }
  }
}
```

### POST /api/auth/login
**Description:** Placeholder endpoint for initiating a session. Returns a static success payload until authentication is implemented.

**Authentication:** Not required.

**Headers:**
- `Content-Type: application/json`
- `Accept: application/json`

**Body:** Optional object (structure will be defined when auth is implemented).

**Sample Response — 200 OK**
```json
{
  "status": "success",
  "message": "Login endpoint placeholder"
}
```

### POST /api/auth/refresh
**Description:** Placeholder endpoint that demonstrates JWT validation via the `authenticate` middleware. Responds with the decoded user payload when a valid token is supplied.

**Authentication:** Required. Supply either of the following:
- `Authorization: Bearer <token>` header with an access token.
- `x-refresh-token: <token>` header when an access token is unavailable.

**Headers:**
- `Accept: application/json`
- `Authorization: Bearer <token>` *(optional if a refresh token header is provided)*
- `x-refresh-token: <token>` *(optional alternative to cookies)*

**Sample Response — 200 OK**
```json
{
  "status": "success",
  "message": "Refresh endpoint placeholder",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

**Error Response — 401 Unauthorized**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

### POST /api/uploads/presign
**Description:** Requests a MinIO presigned URL for either uploading (`operation: "put"`, default) or downloading (`operation: "get"`) a specific object key. The server injects the configured bucket name and returns expiry metadata alongside the signed URL.

**Authentication:** Required. The caller must provide a valid JWT access token (or refresh token via the authenticate middleware fallback).

**Authorization:** Enforced via Casbin. The subject must be permitted to access `resource = "storage:uploads"` with:
- `action = "write"` for upload URLs (`operation: "put"`).
- `action = "read"` for download URLs (`operation: "get"`).

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>` (or equivalent authenticated context)

**Body:**
```jsonc
{
  "objectKey": "editor/20251021-abcdef12-image.png",   // required, no leading slash
  "operation": "put",                                   // optional, "put" (default) or "get"
  "contentType": "image/png",                          // optional, only used for PUT requests
  "expiresIn": 900,                                     // optional seconds, clamped server-side
  "responseHeaders": {                                  // optional, only used for GET requests
    "response-content-disposition": "inline"
  }
}
```

**Success Response — 200 OK**
```json
{
  "status": "success",
  "data": {
    "url": "https://minio.example.com/editor/20251021-abcdef12-image.png?X-Amz-Signature=...",
    "method": "PUT",
    "objectKey": "editor/20251021-abcdef12-image.png",
    "bucket": "udoy-dev-bucket",
    "headers": {
      "Content-Type": "image/png"
    },
    "expiresIn": 900,
    "expiresAt": "2025-10-21T09:45:00.000Z",
    "publicUrl": "https://cdn.udoy.dev/editor/20251021-abcdef12-image.png"
  }
}
```

**Error Response — 400 Bad Request**
```json
{
  "status": "error",
  "message": "A valid objectKey is required for presigned URL requests."
}
```

**Error Response — 503 Service Unavailable**
```json
{
  "status": "error",
  "message": "MinIO configuration is not available."
}
```
