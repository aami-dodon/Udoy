# Components

- Common components (navbar, footer, loaders) live in `src/common` and now include `Navbar` and `ProtectedRoute`.
- Feature-specific UI lives in `src/features/<feature>/components`.
- `HelloMessage` is the baseline example component that renders API data.
- `LoginForm` and `SignupForm` handle the authentication flows with form validation and error handling using Material UI (signup currently exposes Student/Teacher roles; admin accounts are seeded via environment variables). Signup validates password confirmation before calling the backend.
