# Models

- PostgreSQL currently stores users in a `users` table created during bootstrap. The `src/models/user.repository.js` module wraps database access for that table. A future Prisma schema can replace the direct SQL approach when richer modelling is needed.
- Mongoose schemas will live in `src/models/mongoose` once MongoDB-backed features are introduced.
