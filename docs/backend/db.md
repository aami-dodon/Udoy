# Database Architecture

- PostgreSQL access currently uses the `pg` client with a lightweight repository pattern. On startup the server ensures the `users` table exists (id, name, email, normalized email, password hash, role, created timestamp), normalises legacy rows, and seeds an optional admin account when credentials are present in environment variables.
- MongoDB access relies on Mongoose connections located in `src/models` (models will be added in later phases).
- Connection helpers in `src/config/db.js` initialize and expose both database clients for downstream services.
