# Services

- Service modules encapsulate the business logic and talk to external systems or models.
- `hello.service.js` returns a static payload, but future services will orchestrate database work and other dependencies.
- `auth.service.js` hashes credentials, persists users to Postgres via `user.repository.js`, validates passwords, and issues JWTs. Public signup only permits the learner/teacher roles; admin accounts are provisioned through environment-driven seeding.
