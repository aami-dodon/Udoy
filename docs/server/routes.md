# Routes

- All backend routes should be composed under `src/app.js`.
- Feature modules expose an Express router from `<feature>.routes.js`.
- `hello.routes.js` mounts at `/api/hello` and demonstrates the pattern for future modules.
- `auth.routes.js` mounts at `/api/auth` and now handles signup, login, verification, password reset, resend, and profile endpoints.
- `users/user.routes.js` mounts at `/api/users` for authenticated profile updates.
- `admin/users.routes.js` mounts at `/api/admin/users` and is protected by role-based middleware to expose admin-only management endpoints.
