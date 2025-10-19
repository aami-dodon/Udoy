# Modules Overview

The `modules` directory contains the feature-scoped Express routers that make up
Udoy's server API. Each module ships with a `*.routes.js` file that instantiates
an `express.Router` instance and exports it for consumption in
[`index.js`](./index.js). The [`registerModules`](./index.js) function wires
those routers under the API prefix that the main application passes in:

```js
import registerModules from './modules/index.js';

registerModules(app, '/api');
```

Within each folder, controller files (`*.controller.js`) hold the request
handlers that the router delegates to. The controllers are intentionally thin so
behaviour stays close to the HTTP layer and any shared logic lives in services
or integrations (for example Prisma or the MinIO helpers).

## Current modules

| Module | Router | Controller | Description |
| --- | --- | --- | --- |
| [`admin`](./admin/README.md) | [`admin.routes.js`](./admin/admin.routes.js) | [`admin.controller.js`](./admin/admin.controller.js) | Placeholder admin dashboard endpoint guarded by authentication and RBAC. |
| [`auth`](./auth/README.md) | [`auth.routes.js`](./auth/auth.routes.js) | [`auth.controller.js`](./auth/auth.controller.js) | Login and refresh placeholders that exercise the auth middleware chain. |
| [`email`](./email/README.md) | [`email.routes.js`](./email/email.routes.js) | [`email.controller.js`](./email/email.controller.js) | Test harness for transactional email templates powered by Nodemailer. |
| [`health`](./health/README.md) | [`health.routes.js`](./health/health.routes.js) | [`health.controller.js`](./health/health.controller.js) | Readiness probe that checks Prisma, MinIO, and the configured CORS policy. |
| [`uploads`](./uploads/README.md) | [`uploads.routes.js`](./uploads/uploads.routes.js) | [`uploads.controller.js`](./uploads/uploads.controller.js) | MinIO presigned URL generator for secure upload and download flows. |

### Adding a new module

1. Create a folder under `modules/` with a descriptive name.
2. Implement the router file that defines your endpoints and exports an
   `express.Router` instance.
3. Implement controller functions that the router imports.
4. Add the router to [`index.js`](./index.js) so it is mounted beneath the API
   prefix with the rest of the modules.
5. Annotate new routes with OpenAPI comments to keep the Swagger spec in sync.
