# API Specifications

## Overview
- **Base URL:** `${SERVER_URL}/api` (configure via `.env`)
- **Default Content Type:** `application/json`
- **Authentication:** JWT access tokens sent as `Authorization: Bearer <token>` unless noted.
- **Notation:** All timestamps use ISO-8601 format in UTC.

## Endpoint Summary
| Method | Path             | Description                                             | Auth |
| ------ | ---------------- | ------------------------------------------------------- | ---- |
| GET    | /api/health      | Returns service health, uptime, and dependency status. | No   |
| POST   | /api/auth/login  | Placeholder login endpoint.                            | No   |
| POST   | /api/auth/refresh| Placeholder refresh endpoint requiring a valid token.  | Yes  |
| GET    | /api/admin/overview | Placeholder admin overview protected by Casbin. | Yes  |

## Endpoints

### GET /api/health
**Description:** Returns the current health of the service, including checks for Postgres connectivity, MinIO availability, and CORS configuration.

**Authentication:** Not required.

**Headers:**
- `Accept: application/json`

**Query Parameters:** None.

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

**Notes:**
- `uptime` is expressed in seconds.
- Any failing dependency appears under `checks` with a descriptive `message`.

### POST /api/auth/login
**Description:** Placeholder endpoint for initiating a session. Returns a static success payload until authentication is implemented.

**Authentication:** Not required.

**Headers:**
- `Content-Type: application/json`
- `Accept: application/json`

**Body:** TBD (implementation pending).

**Sample Response — 200 OK**
```json
{
  "status": "success",
  "message": "Login endpoint placeholder"
}
```

**Notes:**
- The real implementation should validate credentials, issue tokens, and set the appropriate cookies.

### POST /api/auth/refresh
**Description:** Placeholder endpoint that demonstrates JWT validation via the `authenticate` middleware. Responds with the decoded user payload when a valid token is supplied.

**Authentication:** Required. Accepts an access token via `Authorization: Bearer <token>` or a refresh token via the `x-refresh-token` header/corresponding cookies.

**Headers:**
- `Accept: application/json`
- `Authorization: Bearer <token>` *(optional if a refresh token cookie/header is provided)*
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

**Notes:**
- The middleware attempts to validate access tokens first, then refresh tokens. Future implementations can use the attached `req.user` and `req.auth` context to issue new tokens.

### GET /api/admin/overview
**Description:** Demonstrates a protected admin route that requires both JWT authentication and Casbin authorization. Returns placeholder data along with the authenticated user payload when permitted.

**Authentication:** Required. Uses the `authenticate` middleware to populate `req.user` before enforcing Casbin policies.

**Headers:**
- `Accept: application/json`
- `Authorization: Bearer <token>`

**Sample Response — 200 OK**
```json
{
  "status": "success",
  "message": "Admin overview placeholder",
  "user": {
    "email": "admin@example.com",
    "role": "admin"
  },
  "permissions": {
    "resource": "admin:dashboard",
    "action": "read"
  }
}
```

**Error Response — 403 Forbidden**
```json
{
  "status": "error",
  "message": "Forbidden"
}
```

**Notes:**
- Authorization decisions are delegated to Casbin using the subject (role/email), object (resource), and action parameters defined in `policy.csv`.
- Update the policy or switch to a database adapter when introducing dynamic role assignments.
