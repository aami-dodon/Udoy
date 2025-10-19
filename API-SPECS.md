# API Specifications

## Overview
- **Base URL:** `${SERVER_URL}/api` (configure via `.env`)
- **Default Content Type:** `application/json`
- **Authentication:** JWT access tokens sent as `Authorization: Bearer <token>` unless noted.
- **Notation:** All timestamps use ISO-8601 format in UTC.

## Endpoint Summary
| Method | Path         | Description                                             | Auth |
| ------ | ------------ | ------------------------------------------------------- | ---- |
| GET    | /api/health  | Returns service health, uptime, and dependency status. | No   |

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
