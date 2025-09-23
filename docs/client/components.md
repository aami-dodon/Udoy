# Components

- Common components (navbar, footer, loaders) live in `src/common` and now include `Navbar`, `ProtectedRoute`, and shared layout helpers.
- Feature-specific UI lives in `src/features/<feature>/components`.
- `HelloMessage` is the baseline example component that renders API data.
- `LoginForm` handles authentication (with inline resend verification support), `SignupForm` manages learner/teacher registration, and new forms power forgot/reset password, account updates, and admin user management tables.
