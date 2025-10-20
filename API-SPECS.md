# API Specifications

## Overview
- **Base URL:** `${SERVER_URL}/api`
- **Default Content Type:** `application/json`
- **Authentication:** JWT access tokens supplied via the `Authorization: Bearer <token>` header. Refresh tokens are rotated via `/auth/refresh` and are also issued as HTTP-only cookies.
- **Notation:** All timestamps follow ISO-8601 UTC.
- **Interactive Docs:** Swagger UI lives at `${SERVER_URL}/api/docs` with the OpenAPI JSON available at `${SERVER_URL}/api/docs/swagger.json`.

> The OpenAPI schema is generated from the JSDoc annotations that sit next to each route handler under `app/server/src/modules`.
>
> **Parity Check (2025-10-31):** Verified the Express routers registered from `app/server/src/modules` and confirmed every handler is documented below. No undocumented endpoints were found, and every documented endpoint is implemented in code.

## Endpoint Summary
| Method | Path                             | Description                                                       | Auth |
| ------ | -------------------------------- | ----------------------------------------------------------------- | ---- |
| GET    | /api/health                      | Returns overall service and dependency health.                    | No   |
| POST   | /api/auth/register               | Creates a new account, triggering verification/guardian flows.    | No   |
| POST   | /api/auth/login                  | Authenticates a user and issues fresh access/refresh tokens.      | No   |
| POST   | /api/auth/refresh                | Rotates refresh + access tokens using the stored session.         | Yes  |
| POST   | /api/auth/logout                 | Revokes the active session and clears auth cookies.               | Yes  |
| GET    | /api/auth/session                | Returns the authenticated user profile + session metadata.        | Yes  |
| POST   | /api/auth/verify-email           | Confirms an email verification token and activates the account.   | No   |
| POST   | /api/auth/resend-verification    | Re-sends the verification email for unverified accounts.          | No   |
| POST   | /api/auth/request-password-reset | Starts the password reset flow.                                   | No   |
| POST   | /api/auth/reset-password         | Completes the password reset with a valid token.                  | No   |
| POST   | /api/auth/guardian/approve       | Guardian/coach confirms or revokes a minor’s onboarding token.    | No   |
| GET    | /api/users                       | Lists users with pagination (RBAC protected).                     | Yes  |
| GET    | /api/users/{id}                  | Fetches details for a single user.                                | Yes  |
| PATCH  | /api/users/{id}                  | Updates profile fields or lifecycle status.                       | Yes  |
| POST   | /api/users/{id}/roles            | Replaces the set of roles assigned to a user.                     | Yes  |
| DELETE | /api/users/{id}/roles/{roleName} | Removes a single role from the user.                              | Yes  |
| GET    | /api/roles                       | Lists the role catalogue with bundled capabilities.               | Yes  |
| GET    | /api/admin/overview              | RBAC-gated dashboard overview payload.                            | Yes  |
| POST   | /api/email/test                  | Sends a verification or password-reset test email.                | Yes  |
| POST   | /api/uploads/presign             | Generates a MinIO presigned URL for uploads/downloads.            | Yes  |

## Endpoints

### GET /api/health
Checks Postgres, MinIO, and CORS configuration to report overall service readiness.

Auth: Not required.
Params: None.
Query: None.
Body: None.
Response 200:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.45,
  "checks": {
    "database": { "status": "up" },
    "minio": { "status": "up", "bucket": "udoy" }
  },
  "cors": {
    "enabled": true,
    "allowedOrigins": ["https://app.example.com"],
    "allowCredentials": true
  }
}
```
Response 503: Same shape with `status: "error"` and dependency failure details.

### POST /api/auth/register
Creates a new Udoy account, attaches the permitted self-serve role, sends verification email, and (for minors) triggers guardian approval.

Auth: Not required.
Params: None.
Query: None.
Body:
```json
{
  "email": "student@example.com",
  "password": "Sup3rSafe!",
  "firstName": "Aarav",
  "lastName": "Singh",
  "dateOfBirth": "2012-05-18",
  "phoneNumber": "+919000000000",
  "guardianEmail": "guardian@example.com",
  "role": "student"
}
```
Response 201:
```json
{
  "status": "success",
  "message": "Registration successful. Please verify your email to activate the account.",
  "user": { /* AuthUserProfile */ }
}
```
Response 400: Validation errors such as missing required fields, invalid emails, or guardian data mismatches.

### POST /api/auth/login
Authenticates by email/password, updates the last login timestamp, records a new session, and issues fresh JWT + refresh tokens.

Auth: Not required.
Params: None.
Query: None.
Body:
```json
{ "email": "user@example.com", "password": "SecretPass123" }
```
Response 200:
```json
{
  "status": "success",
  "message": "Login successful.",
  "tokens": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "accessTokenExpiresIn": 900,
    "refreshTokenExpiresIn": 604800
  },
  "session": {
    "id": "sess_abc123",
    "expiresAt": "2025-01-12T10:15:00.000Z"
  },
  "user": { /* AuthUserProfile */ }
}
```
Response Notes: The `message` is "Login successful." or "Login successful. Email verification is still pending." depending on the account status.
Response 401: Invalid email/password combination.
Response 403: Account is locked or deactivated.

### POST /api/auth/refresh
Rotates the refresh token, issues a new access token pair, and re-attaches auth cookies.

Auth: Requires a valid refresh token (HTTP-only cookie, `x-refresh-token` header, or request body).
Params: None.
Query: None.
Body:
```json
{ "refreshToken": "<refresh-token>" }
```
Response 200: Same envelope as `POST /api/auth/login` with the new token pair and session details.
Response 401: Missing, expired, or revoked refresh token.

### POST /api/auth/logout
Revokes the current session, records an audit event, and clears auth cookies.

Auth: Access token required (refresh token in cookies also cleared).
Params: None.
Query: None.
Body:
```json
{ "sessionId": "sess_abc123" }
```
Session ID is optional—omit it to revoke the authenticated session.
Response 200:
```json
{ "status": "success", "message": "Successfully logged out." }
```
Response 401: Missing or invalid authentication context.

### GET /api/auth/session
Returns the authenticated user profile plus session metadata for client rehydration.

Auth: Access token required.
Params: None.
Query: None.
Body: None.
Response 200:
```json
{
  "status": "success",
  "user": { /* AuthUserProfile */ },
  "session": {
    "id": "sess_abc123",
    "roles": ["student"],
    "permissions": [
      { "name": "content.consume", "resource": "learning-content", "action": "consume" }
    ]
  }
}
```
Response 401: Authentication required.

### POST /api/auth/verify-email
Consumes an email verification token, marks the account verified, and promotes invited users to `ACTIVE` status.

Auth: Not required.
Params: None.
Query: None.
Body:
```json
{ "token": "verification-token" }
```
Response 200:
```json
{ "status": "success", "message": "Email address verified successfully.", "user": { /* AuthUserProfile */ } }
```
Response 400: Missing token or invalid/expired verification token.

### POST /api/auth/resend-verification
Reissues the email verification link if the account exists and is not yet verified.

Auth: Not required.
Params: None.
Query: None.
Body:
```json
{ "email": "user@example.com" }
```
Response 200:
```json
{ "status": "success", "message": "Verification email re-sent successfully." }
```
Response Notes: If the account is already verified the message reads "Email address is already verified.".
Response 400: Missing or invalid email address payload.

### POST /api/auth/request-password-reset
Generates a one-hour password reset token and dispatches the corresponding email.

Auth: Not required.
Params: None.
Query: None.
Body:
```json
{ "email": "user@example.com" }
```
Response 200:
```json
{ "status": "success", "message": "If the account exists, password reset instructions will be sent." }
```
Response 400: Missing or invalid email address payload.

### POST /api/auth/reset-password
Validates a password reset token, updates the stored password hash, and reactivates the account.

Auth: Not required.
Params: None.
Query: None.
Body:
```json
{ "token": "reset-token", "password": "NewStrongPass!" }
```
Response 200:
```json
{
  "status": "success",
  "message": "Password reset successfully. You can now log in with the new password."
}
```
Response 400: Missing token/password or invalid token state.

### POST /api/auth/guardian/approve
Records guardian consent (or revocation) for a student using the emailed approval token.

Auth: Not required.
Params: None.
Query: None.
Body:
```json
{ "token": "guardian-token", "approve": true }
```
Response 200:
```json
{
  "status": "success",
  "message": "Guardian approval recorded.",
  "link": { /* GuardianLink */ }
}
```
Response Notes: When `approve` is `false` the success message becomes "Guardian approval revoked.".
Response 400: Missing token or token lacking required guardian metadata.

### GET /api/users
Lists user profiles with pagination and returns their current role bindings.

Auth: Yes – requires `user:manage` permission.
Params: None.
Query: `page` (integer ≥ 1, default 1), `pageSize` (integer 1-100, default 25).
Body: None.
Response 200:
```json
{
  "status": "success",
  "data": {
    "items": [{ /* AuthUserProfile */ }],
    "page": 1,
    "pageSize": 25,
    "total": 100
  }
}
```
Response 401/403: Missing authentication or lacking required permission.

### GET /api/users/{id}
Fetches a single user profile, including guardian links, for management workflows.

Auth: Yes – requires `user:manage` permission.
Params: `id` (string, required).
Query: None.
Body: None.
Response 200:
```json
{ "status": "success", "user": { /* AuthUserProfile */ } }
```
Response 404: User not found.

### PATCH /api/users/{id}
Updates mutable profile details or lifecycle status for a specific user.

Auth: Yes – requires `user:manage` permission.
Params: `id` (string, required).
Query: None.
Body:
```json
{
  "firstName": "Aarav",
  "lastName": "Singh",
  "phoneNumber": "+919000000000",
  "dateOfBirth": "2010-04-01",
  "guardianEmail": "guardian@example.com",
  "guardianName": "Parent Name",
  "status": "ACTIVE"
}
```
Response 200:
```json
{ "status": "success", "user": { /* AuthUserProfile */ } }
```
Response 400: Invalid payload (e.g., unsupported status value).
Response 404: User not found.

### POST /api/users/{id}/roles
Replaces the complete set of role assignments for a user after validating against the role catalogue.

Auth: Yes – requires `role:manage` permission.
Params: `id` (string, required).
Query: None.
Body:
```json
{ "roles": ["student", "creator"] }
```
Response 200:
```json
{ "status": "success", "user": { /* AuthUserProfile */ } }
```
Response 400: Payload is not an array of valid role names.
Response 404: User not found.

### DELETE /api/users/{id}/roles/{roleName}
Removes a single role binding from the specified user.

Auth: Yes – requires `role:manage` permission.
Params: `id` (string, required), `roleName` (string, required).
Query: None.
Body: None.
Response 200:
```json
{ "status": "success", "user": { /* AuthUserProfile */ } }
```
Response 400: Missing user ID or role name.
Response 404: User not found.

### GET /api/roles
Returns the configured role catalogue along with bundled permissions used by Casbin.

Auth: Yes – requires `role:manage` permission.
Params: None.
Query: None.
Body: None.
Response 200:
```json
{
  "status": "success",
  "roles": [
    {
      "name": "student",
      "label": "Student",
      "description": "Learner role",
      "permissions": [
        {
          "name": "content.consume",
          "resource": "learning-content",
          "action": "consume",
          "description": "Access assigned lessons and media."
        }
      ]
    }
  ]
}
```
Response 401/403: Missing authentication or lacking required permission.

### GET /api/admin/overview
Provides the RBAC-protected admin dashboard placeholder payload showing which permission granted access.

Auth: Yes – requires `admin:dashboard` resource with `read` action.
Params: None.
Query: None.
Body: None.
Response 200:
```json
{
  "status": "success",
  "message": "Admin overview placeholder",
  "user": { /* AuthUserProfile */ },
  "permissions": { "resource": "admin:dashboard", "action": "read" }
}
```
Response 401/403: Missing authentication or lacking required permission.

### POST /api/email/test
Sends the verification or password reset template using the configured Nodemailer transport in test mode.

Auth: Yes – requires `email:test` permission (action inferred from HTTP method).
Params: None.
Query: None.
Body:
```json
{
  "to": "recipient@example.com",
  "type": "verification",
  "name": "Udoy Tester",
  "template": "custom-verify.html",
  "textTemplate": "custom-verify.txt",
  "variables": { "ctaUrl": "https://example.com" }
}
```
Response 200:
```json
{ "status": "success", "message": "Test verification email sent to recipient@example.com." }
```
Response Notes: The message reflects the dispatched template type (`verification` or `passwordReset`).
Response 400: Missing `to` address or invalid payload shape.
Response 401/403: Missing authentication or lacking required permission.

### POST /api/uploads/presign
Generates a MinIO presigned URL for object uploads or downloads and returns supporting metadata.

Auth: Yes – requires `storage:uploads` permission (action resolved from requested operation).
Params: None.
Query: None.
Body:
```json
{
  "objectKey": "uploads/videos/demo.mp4",
  "operation": "put",
  "expiresIn": 900,
  "contentType": "video/mp4",
  "responseHeaders": {
    "response-content-disposition": "attachment"
  }
}
```
Response 200:
```json
{
  "status": "success",
  "data": {
    "url": "https://minio.example.com/presigned",
    "method": "PUT",
    "objectKey": "uploads/videos/demo.mp4",
    "bucket": "udoy",
    "headers": { "Content-Type": "video/mp4" },
    "expiresIn": 900,
    "expiresAt": "2024-01-01T12:15:00.000Z",
    "publicUrl": "https://cdn.example.com/uploads/videos/demo.mp4"
  }
}
```
Response 400: Invalid or missing `objectKey`/operation details.
Response 401/403: Missing authentication or lacking required permission.
Response 503: MinIO unavailable or not configured.

