# Database Architecture

- PostgreSQL access will be handled through Prisma. Add a `prisma/schema.prisma` file and run `prisma generate` when models are defined.
- MongoDB access will rely on Mongoose models located in `src/models`.
- Connection helpers in `src/config/db.js` return placeholders until credentials are supplied.
