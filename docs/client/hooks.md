# Hooks

- `useAuth` consumes the `AuthContext` and exposes auth state plus helper methods for login, signup, logout, refreshing account data, updating account details, and retrieving the support email handed back by the backend.
- `useStorage` wraps MinIO presigned URL helpers, providing authenticated helpers to request upload/download signatures and execute the resulting fetch calls.
- Additional hooks should live in `src/hooks` as shared behaviours are extracted.
