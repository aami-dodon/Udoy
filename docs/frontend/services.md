# Frontend Services

HTTP utilities live in `src/utils/api.js`, which standardises JSON requests and error handling.

- `features/auth/services/authService.js` wraps the signup, login, and profile requests.
- As the app grows, feature-specific services should follow the same pattern and reuse the shared fetch helper.
