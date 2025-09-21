# Changelog

## 0.2.0 - Auth basics
- Added JWT-based signup, login, and profile endpoints backed by Postgres.
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
