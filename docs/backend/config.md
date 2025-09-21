# Backend Configuration

- `src/config/env.js` loads `.env` variables and exposes typed helpers. The server expects `POSTGRES_URL`, `MONGO_URI`, and the MinIO keys (`MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_USE_SSL`).
- `src/config/db.js` opens real connections to PostgreSQL (via `pg`) and MongoDB (via `mongoose`). Startup fails immediately if connectivity or authentication is invalid.
- `src/config/minio.js` builds a MinIO client using the official SDK and verifies that the configured bucket exists before allowing the HTTP server to boot.
