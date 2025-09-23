# Admin › Users Module

- Routes: `users.routes.js` exposes `/api/admin/users` with JWT + RBAC guards.
- Controller: `users.controller.js` maps HTTP payloads to service calls.
- Service: `users.service.js` runs admin-safe mutations, notifications, and audit logging via Prisma.
- Validation: `users.validation.js` ensures path/body params are consistent before execution.
