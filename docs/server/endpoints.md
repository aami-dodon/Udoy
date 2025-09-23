# Backend Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/hello` | Returns a Hello World message |
| POST   | `/api/auth/signup` | Registers a new learner/teacher, issues a verification email, and echoes support contact info |
| POST   | `/api/auth/login` | Authenticates verified, active accounts and returns a JWT |
| GET    | `/api/auth/me` | Returns the authenticated account details (requires Bearer token) |
| GET    | `/api/auth/verify/:token` | Confirms an email-verification token and activates the account |
| POST   | `/api/auth/forgot-password` | Creates a reset token and mails instructions (response is intentionally generic) |
| POST   | `/api/auth/reset-password` | Resets the password using a valid token |
| POST   | `/api/auth/resend-verification` | Issues a fresh verification email for pending accounts |
| PUT    | `/api/account` | Updates account fields; supports name, email change (with re-verification), and password rotation |
| GET    | `/api/admin/users` | Lists all users for admin dashboards |
| PUT    | `/api/admin/users/:id` | Allows admins to edit name, role, verification, or activation state |
| DELETE | `/api/admin/users/:id` | Performs a soft delete/deactivation and notifies the user |

> Expand this table as new feature modules are introduced.
