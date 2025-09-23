# Changelog

## 0.5.0 - Security hardening groundwork
- Added centralized request validation with `express-validator` across auth, user, and admin APIs, including consistent error payloads.
- Protected authentication endpoints with environment-configurable rate limits using `express-rate-limit`.
- Introduced reusable presigned MinIO URL helpers to keep uploads/downloads behind time-bound signatures.
- Implemented role-aware admin audit logging backed by Postgres with regression coverage for update and delete flows.
- Configured an environment-driven CORS whitelist supporting multiple trusted frontend origins.
- Hardened defaults with IPv6-safe rate limit keys, stricter error responses, and secure Express proxy settings.

## 0.4.0 - Logging and API documentation
- Integrated Winston with Morgan to deliver structured JSON request, response, and error logs including request IDs.
- Added centralized error-handling middleware with sanitized production responses and richer diagnostic metadata in development.
- Enabled log-level configuration via `LOG_LEVEL` and refreshed `.env.example` guidance for new operational settings.
- Exposed auto-generated Swagger UI at `/api/docs` and `/api/docs.json`, documenting auth, user, admin, and health-check routes.
- Added regression tests confirming logging output and OpenAPI paths to prevent coverage regressions.

## 0.3.0 - User management lifecycle
- Added email-verification workflow with hashed tokens, resend support, and gated login for unverified accounts.
- Implemented password-reset, account update, and admin account management endpoints backed by Postgres.
- Delivered eight transactional email templates powered by a shared brand theme and SMTP configuration.
- Expanded client auth flows with verification, recovery, account, and admin dashboards plus reusable notifications.
- Documented new environment variables, repositories, services, and routes introduced in Phase 3.

## 0.2.0 - Auth basics
- Added JWT-based signup, login, and account endpoints backed by Postgres.
- Implemented credential validation for MongoDB and MinIO during server bootstrap.
- Introduced client-side auth context, protected routes, and dashboard UX.
- Added optional admin seeding via environment variables and aligned database migrations.
- Extended role support to include `admin`, updated signup UI to keep student/teacher options, and enforced new constraints at bootstrap.
- Documented Phase 2 functionality, environment variables, and new modules.

## 0.1.0 - Initial scaffold
- Set up monorepo structure for client, server, shared, and docs
- Added Hello World feature across backend and frontend
- Added placeholder configs for databases, MinIO, and environment variables
- Added Docker configuration for local development
