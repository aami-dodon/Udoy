# Frontend Services

HTTP utilities live in `src/utils/api.js`, which standardises JSON requests and error handling.

- `features/auth/services/authService.js` wraps signup, login, account retrieval, verification, resend, and password-reset requests.
- `features/account/services/accountService.js` sends authenticated account updates.
- `features/admin/services/adminService.js` encapsulates admin-specific list/update/delete requests and attaches the caller's token automatically.
- As the app grows, feature-specific services should follow the same pattern and reuse the shared fetch helper.
