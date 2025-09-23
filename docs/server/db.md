# Database Architecture

- PostgreSQL access now flows through Prisma. The schema lives in `prisma/schema.prisma`, migrations are executed with `npm run prisma:migrate` (Docker runs this automatically before boot), and the generated client (refresh with `npm run prisma:generate`) is shared via `src/config/db.js`.
- Domain repositories (`src/models/*.repository.js`) use the Prisma client to interact with relational data. Current models cover users, user tokens, and audit logs, each mapping to the Prisma schema and shared DTOs.
- MongoDB access still relies on Mongoose connections located in `src/models` (collections will be added in later phases).
- `src/config/db.js` centralises database wiring, exposing `connectPostgres`, `getPrismaClient`, `connectMongo`, and `closeConnections` to the rest of the application.
