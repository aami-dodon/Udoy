# Models

- PostgreSQL currently stores users in a `users` table created during bootstrap. The `src/models/user.repository.js` module wraps database access for that table, exposing helpers for creation, queries, activation toggles, and soft deletion.
- Email and password reset workflows rely on `src/models/token.repository.js`, which manages hashed records in the `user_tokens` table so raw tokens are never persisted.
- Mongoose schemas will live in `src/models/mongoose` once MongoDB-backed features are introduced.
