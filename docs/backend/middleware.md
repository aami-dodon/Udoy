# Middleware

- `requestLogger` attaches morgan logging for request tracing.
- `errorHandler` standardises API error responses and ensures unhandled errors are logged.
- `auth.js` exposes `authenticate` and `authorizeRoles` helpers that verify JWTs before protected handlers run.
