# Health Module

The health module powers the platform readiness probe. It aggregates status
checks from core dependencies and exposes them at a single unauthenticated
endpoint so uptime monitors and load balancers can verify the service.

## Route → [`health.routes.js`](./health.routes.js)

- `GET /api/health`
  - No authentication/authorization middleware so infrastructure tooling can hit
    it freely.
  - OpenAPI documentation spells out the `200` success payload and the `503`
    failure schema.

## Controller → [`health.controller.js`](./health.controller.js)

- `getHealthStatus`
  - Runs `prisma.healthCheck.count()` to confirm database connectivity.
  - Uses the MinIO integration (`getMinioClient`, `getMinioBucket`,
    `isMinioConfigured`) to ensure the client is configured and the target bucket
    exists.
  - Echoes the active CORS settings (`env.corsAllowedOrigins`) so operators can
    spot misconfigurations from the health response.
  - Returns `{ status: 'ok' | 'error', timestamp, uptime, checks, cors }` and
    switches the HTTP status code to `503` whenever any dependency fails.

Add more checks by appending entries to the `checks` object and flipping the
`isHealthy` flag when a dependency cannot be reached.
