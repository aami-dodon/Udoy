# API Specifications

## 2025-10-19 06:11 IST
### Health Check
- **Method:** GET
- **Endpoint:** /api/health
- **Description:** Returns the service status after verifying database connectivity.
- **Response:**
  ```json
  {
    "status": "ok"
  }
  ```

## 2025-10-19 07:05 IST
### Health Check
- **Method:** GET
- **Endpoint:** /api/health
- **Description:** Provides uptime information and the status of database, MinIO, and CORS configuration checks.
- **Success Response (200):**
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
- **Error Response (503):** The `status` field is set to `"error"` and the failing checks include a descriptive `message`.
