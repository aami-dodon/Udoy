# Admin Module

The admin module currently contains a single RBAC-protected endpoint that shows
how the platform's privileged dashboards will be structured.

## Route

- `GET /api/admin/overview` → [`admin.routes.js`](./admin.routes.js)
  - Chains the shared [`authenticate`](../../middlewares/authenticate.js)
    middleware so only authenticated callers reach the handler.
  - Applies [`authorize`](../../middlewares/authorize.js) with the
    `{ resource: 'admin:dashboard', action: 'read' }` policy requirement.
  - Documents the contract with OpenAPI annotations that appear in Swagger.

## Controller

- `getAdminOverview` → [`admin.controller.js`](./admin.controller.js)
  - Responds with `{ status: 'success', message: 'Admin overview placeholder', ... }`.
  - Echoes `req.user` (if present) so you can confirm the authentication context
    propagated through the middleware stack.
  - Includes the permission metadata the caller needed to pass the authorization
    check, making the payload self-descriptive for UI consumers.

When you add real admin features, expand this module with additional routes and
controllers. Keep explicit authorization rules on every handler so the expected
RBAC requirements stay obvious in code review.
