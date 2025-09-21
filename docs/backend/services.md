# Services

- Service modules encapsulate the business logic and talk to external systems or models.
- `hello.service.js` returns a static payload, but future services will orchestrate database work and other dependencies.
- `auth.service.js` now manages full account lifecycle: signup with verification tokens, login gating, profile reads, password resets, resend flows, and email notifications while persisting hashes and token metadata to Postgres.
- `users/user.service.js` enforces sensitive profile updates (name, email, password) with password re-authentication, email change token issuance, and follow-up notifications.
- `admin/users.service.js` lets admins toggle activation, adjust roles/verification state, and perform soft deletes with corresponding email alerts.
