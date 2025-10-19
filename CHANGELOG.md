# Changelog

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
