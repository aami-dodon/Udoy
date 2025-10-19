# Changelog

## 2025-10-21 18:30 IST
- Secured the `/api/email/test` endpoint with JWT authentication and Casbin enforcement using the new `email:test` resource mapping HTTP verbs to RBAC actions.
- Granted the admin role permission to invoke the email testing endpoint and documented the requirement in the Casbin policy file.
- Updated Swagger and `API-SPECS.md` entries to describe the authentication, authorization, and error semantics for the test email route.

## 2025-10-19 23:43 IST
- Removed the client-wide `body` overrides so Tailwind preflight and theme utilities govern fonts and spacing.
- Introduced a shared app root layout utility and applied it in the React entry point for consistent typography/background.
- Verified the Vite client renders correctly with Tailwind-driven styles via the dev server.

## 2025-10-21 15:45 IST
- Extended the MinIO integration with presigned URL helpers, configuration guards, and a dedicated integration index for reuse.
- Added secured `/api/uploads/presign` routing that issues upload/download URLs via JWT + Casbin checks with expiry metadata.
- Created shared editor upload utilities to request presigned URLs and stream assets directly to MinIO from the client.
- Documented the new storage endpoint in `API-SPECS.md` and refreshed health checks to surface MinIO readiness state.

## 2025-10-21 12:30 IST
- Added Swagger JSDoc tooling and UI to the server with a documented `/api/docs` route and JSON schema feed.
- Annotated health and auth routes to auto-generate the OpenAPI spec and aligned `API-SPECS.md` with the schema.
- Installed Swagger dependencies in the server package and introduced configuration helpers under `src/config/swagger.js`.

## 2025-10-19 17:49 IST
- Added a Nodemailer transporter integration configured via central environment settings with Winston error logging.
- Built an email service with templated verification and password reset helpers plus a test endpoint for triggering sends.
- Updated the client home dashboard with a form to send test emails and documented the new API.

## 2025-10-19 17:24 IST
- Added Casbin with a file-backed policy and enforcer singleton under `server/src/integrations/casbin/`.
- Created authorization middleware and an admin overview route gated by JWT + Casbin checks.
- Documented the admin API endpoint, policy structure, and installed the RBAC dependency.

## 2025-10-21 09:45 IST
- Introduced JWT configuration, utilities, and authentication middleware scaffolding on the server.
- Added placeholder auth routes with documentation updates to outline login and refresh flows.
- Installed JWT and hashing dependencies to support future auth implementation work.

## 2025-10-20 12:10 IST
- Expanded the shared Tailwind preset with an earthy blue brand palette, golden accents, typography scale, spacing tokens, and shared shadows.
- Registered `@tailwindcss/forms` across apps and documented how to consume the new design tokens.
- Updated the client health dashboard to showcase the refreshed tokens and ensure the preset is wired through the Vite build.

## 2025-10-19 16:45 IST
- Added shared Tiptap editor configuration (extensions, defaults, styling tokens) under `app/shared/editor/` for reuse across apps.
- Implemented a reusable `RichTextEditor` React component that consumes the shared preset and exposes asset upload callbacks.
- Documented integration guidelines and component usage in the shared editor README.
- Installed Tiptap dependencies and PropTypes in the client package to support the new editor component.

## 2025-10-19 08:11 IST
- Realigned the server code to use module-based routing and dedicated integrations, and added project scaffolding directories to match the prescribed structure guidelines.

## 2025-10-19 05:39 IST
- Initialized project structure with client (React + Vite) and server (Express) applications.
- Added environment template, Docker configuration, and baseline documentation.

## 2025-10-19 06:11 IST
- Integrated Prisma ORM with an initial `HealthCheck` model and generated migrations.
- Updated the health check endpoint to validate database connectivity via Prisma.
- Added graceful shutdown handling to close Prisma connections during server exit.

## 2025-10-19 07:05 IST
- Enhanced the health check endpoint to report database, MinIO, and CORS status along with server uptime.
- Introduced a MinIO client integration and refreshed the client dashboard to surface the detailed health metrics.

## 2025-10-19 07:13 IST
- Updated the Vite client configuration to read the allowed host list and port from environment variables, enabling `CLIENT_ALLOWED_HOSTS` overrides.
