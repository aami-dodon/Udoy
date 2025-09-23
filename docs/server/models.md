# Models

- Prisma models (`User`, `UserToken`, `AuditLog`) are defined in `prisma/schema.prisma` and consumed by repositories under `src/models`. The schema mirrors the LMS domains with enums for roles and token types.
- `src/models/user.repository.js` provides user lifecycle helpers (creation, lookups, activation toggles, soft deletion) backed by Prisma queries.
- `src/models/token.repository.js` manages hashed verification/reset tokens and cleanup via Prisma.
- `src/models/auditLog.repository.js` records administrative actions against users.
- Upcoming relational entities (`Course`, `Module`, `Lesson`, `Enrollment`) and Mongo-backed progress collections (`UserProgress`, `EventLog`) should extend this file and the schema as they are introduced.
