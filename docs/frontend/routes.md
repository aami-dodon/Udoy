# Routes

Application routes are declared in `src/routes.jsx` using `react-router-dom` and the `ProtectedRoute` helper for auth-gated screens.

- `/` renders `HelloPage` by default for the initial scaffold.
- `/login` renders `LoginPage`.
- `/signup` renders `SignupPage`.
- `/dashboard` is wrapped in `ProtectedRoute` and is only visible to authenticated students or teachers.
