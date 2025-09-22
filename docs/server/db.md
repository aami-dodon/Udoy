# Database Architecture

- PostgreSQL access currently uses the `pg` client with a lightweight repository pattern. On startup the server ensures both the `users` and `user_tokens` tables exist. The users table now tracks verification, activation, audit timestamps, and soft-deletion markers; the tokens table stores hashed verification/reset tokens with expiries and metadata. Legacy rows are normalised and optional admin credentials are refreshed when present in environment variables.
- MongoDB access relies on Mongoose connections located in `src/models` (models will be added in later phases).
- Connection helpers in `src/config/db.js` initialize and expose both database clients for downstream services.
