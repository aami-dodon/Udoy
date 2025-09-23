# Server Documentation

Express API following feature-based modules mirrored by the frontend. Uses Prisma (PostgreSQL) and Mongoose (MongoDB) plus MinIO in
tegration.

## Modules
- `auth` registration/login.
- `courses` catalog and enrollment.
- `dashboard` analytics by role.
- `landing` marketing highlights.

## Testing
Run `npm run test -w server` for Jest + Supertest integration tests.
