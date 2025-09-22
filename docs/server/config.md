# Backend Configuration

- `src/config/env.js` loads `.env` variables and exposes typed helpers. The server expects `POSTGRES_URL`, `MONGO_URI`, JWT settings (`JWT_SECRET`, `JWT_EXPIRES_IN`), MinIO keys (`MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_USE_SSL`), SMTP details (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`, `SMTP_FROM`), a `SUPPORT_EMAIL`, and optional admin seeding credentials (`ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_ROLE`, defaulting to `admin`).
- `src/config/db.js` opens real connections to PostgreSQL (via `pg`) and MongoDB (via `mongoose`). Startup fails immediately if connectivity or authentication is invalid.
- `src/config/minio.js` builds a MinIO client using the official SDK and verifies that the configured bucket exists before allowing the HTTP server to boot.
- `src/config/email.js` provisions a Nodemailer transporter when SMTP is configured and falls back to console logging in local environments.
