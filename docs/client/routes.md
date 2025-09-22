# Routes

Application routes are declared in `src/routes.jsx` using `react-router-dom` and the `ProtectedRoute` helper for auth-gated screens.

- `/` renders `HelloPage` by default for the initial scaffold.
- `/login` renders `LoginPage` and includes resend verification support.
- `/signup` renders `SignupPage` and reminds users to check their inbox.
- `/forgot-password`, `/reset-password`, and `/verify-email` power the recovery and verification flows exposed by the backend.
- `/dashboard` is wrapped in `ProtectedRoute` and is visible to any authenticated role.
- `/profile` is protected and allows account updates.
- `/admin/users` is protected by `ProtectedRoute` and restricted to admins via the context-aware role guard.
