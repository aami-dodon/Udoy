# API Specifications

## Overview
- **Base URL:** `${SERVER_URL}/api`
- **Default Content Type:** `application/json`
- **Authentication:** JWT access tokens supplied via the `Authorization: Bearer <token>` header. Refresh tokens are rotated via `/auth/refresh` and are also issued as HTTP-only cookies.
- **Notation:** All timestamps follow ISO-8601 UTC.
- **Interactive Docs:** Swagger UI lives at `${SERVER_URL}/api/docs` with the OpenAPI JSON available at `${SERVER_URL}/api/docs/swagger.json`.

> The OpenAPI schema is generated from the JSDoc annotations that sit next to each route handler under `app/server/src/modules`.

## Endpoint Summary
| Method | Path                               | Description                                                       | Auth |
| ------ | ---------------------------------- | ----------------------------------------------------------------- | ---- |
| GET    | /api/health                        | Returns overall service and dependency health.                    | No   |
| POST   | /api/auth/register                 | Creates a new account, guardian workflow optional.                | No   |
| POST   | /api/auth/login                    | Authenticates a user and issues fresh access/refresh tokens.      | No   |
| POST   | /api/auth/refresh                  | Rotates refresh + access tokens using the stored session.         | Yes  |
| POST   | /api/auth/logout                   | Revokes the active session and clears auth cookies.               | Yes  |
| GET    | /api/auth/session                  | Returns the authenticated user + session metadata.                | Yes  |
| POST   | /api/auth/verify-email             | Confirms an email verification token.                             | No   |
| POST   | /api/auth/resend-verification      | Re-sends the verification email.                                  | No   |
| POST   | /api/auth/request-password-reset   | Starts the password reset flow.                                   | No   |
| POST   | /api/auth/reset-password           | Completes the password reset with a valid token.                  | No   |
| POST   | /api/auth/guardian/approve         | Guardian/coach confirms a minor’s onboarding token.               | No   |
| GET    | /api/users                         | Lists users with pagination (RBAC protected).                     | Yes  |
| GET    | /api/users/{id}                    | Fetches details for a single user.                                | Yes  |
| PATCH  | /api/users/{id}                    | Updates profile fields or lifecycle status.                       | Yes  |
| POST   | /api/users/{id}/roles              | Replaces the set of roles assigned to a user.                     | Yes  |
| DELETE | /api/users/{id}/roles/{roleName}   | Removes a single role from the user.                              | Yes  |
| GET    | /api/roles                         | Lists the role catalogue with bundled capabilities.               | Yes  |
| GET    | /api/admin/overview                | RBAC-gated dashboard overview payload.                            | Yes  |
| POST   | /api/email/test                    | Sends a verification or password-reset test email.                | Yes  |
| POST   | /api/uploads/presign               | Generates a MinIO presigned URL for uploads/downloads.            | Yes  |

## Endpoints

### POST /api/auth/register
Creates a new Udoy account. If the registrant is a minor (determined client-side), guardian details should be supplied so that a guardian approval token is emailed.

- **Auth:** Not required.
- **Body:**
  ```json
  {
    "email": "student@example.com",
    "password": "Sup3rSafe!",
    "firstName": "Aarav",
    "lastName": "Singh",
    "dateOfBirth": "2012-05-18",
    "phoneNumber": "+91-9000000000",
    "guardianEmail": "guardian@example.com",
    "guardianName": "Riya Singh"
  }
  ```
- **Responses:**
  - `201 Created` – returns `{ status, message, user }` and dispatches verification + guardian emails.
  - `400 Bad Request` – duplicate email or validation failure.

### POST /api/auth/login
Authenticates the user using email/password, updates `lastLoginAt`, creates a new session record, and issues fresh access/refresh tokens (also returned as HTTP-only cookies).

- **Auth:** Not required.
- **Body:** `{ "email": "user@example.com", "password": "secret" }`
- **Response 200:**
  ```json
  {
    "status": "success",
    "message": "Login successful.",
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
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
- **Errors:** `401` for invalid credentials, `403` for locked/deactivated accounts.

### POST /api/auth/refresh
Rotates the refresh token and returns a new access token. The refresh token must be valid, unrevoked, and unexpired.

- **Auth:** Requires a valid refresh token (cookie or body/header).
- **Body:** Optional `{ "refreshToken": "..." }` when cookies aren’t used.
- **Response 200:** Same envelope as `/auth/login` with fresh tokens and session metadata.
- **Errors:** `401` when the refresh token is missing, expired, mismatched, or revoked.

### POST /api/auth/logout
Revokes the current session, clears auth cookies, and logs the event.

- **Auth:** Access token or refresh token required.
- **Response 200:** `{ "status": "success", "message": "Successfully logged out." }`

### GET /api/auth/session
Returns the authenticated user profile and session metadata, allowing the client to hydrate state after reload.

- **Auth:** Required.
- **Response 200:**
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

### POST /api/auth/verify-email
Marks a verification token as consumed and sets `isEmailVerified = true`. Invited users are promoted to `ACTIVE` status.

- **Auth:** Not required.
- **Body:** `{ "token": "verification-token" }`
- **Response 200:** `{ status, message, user }`

### POST /api/auth/resend-verification
Re-sends the verification email if the account exists and is not already verified.

- **Auth:** Not required.
- **Body:** `{ "email": "user@example.com" }`
- **Response 200:** Generic success message regardless of account existence.

### POST /api/auth/request-password-reset
Starts the password reset workflow by generating a one-hour token and emailing it to the user.

- **Auth:** Not required.
- **Body:** `{ "email": "user@example.com" }`
- **Response 200:** Generic success acknowledgement.

### POST /api/auth/reset-password
Consumes a password reset token and updates the stored password hash.

- **Auth:** Not required.
- **Body:** `{ "token": "reset-token", "password": "NewStrongPass" }`
- **Response 200:** `{ status, message }`

### POST /api/auth/guardian/approve
Allows guardians/coaches to approve or revoke a minor’s onboarding using the emailed token.

- **Auth:** Not required.
- **Body:** `{ "token": "guardian-token", "approve": true }`
- **Response 200:** `{ status, message, link }` where `link` reflects the updated `GuardianLink` record.

### GET /api/users
Lists users with pagination and includes their assigned roles/permissions.

- **Auth:** Yes (requires `resource = user`, `action = manage`).
- **Query:** `page`, `pageSize` (defaults: 1 / 25).
- **Response 200:** `{ status, data: { items: [AuthUserProfile], page, pageSize, total } }`

### GET /api/users/{id}
Returns a single user profile (including guardian links) for RBAC-governed management.

- **Auth:** Yes (`user:manage`).
- **Response 200:** `{ status, user: AuthUserProfile }`

### PATCH /api/users/{id}
Updates mutable profile fields (names, phone, guardian info) or lifecycle status.

- **Auth:** Yes (`user:manage`).
- **Body:** Any subset of `firstName`, `lastName`, `phoneNumber`, `dateOfBirth`, `guardianEmail`, `guardianName`, `status`.
- **Response 200:** Updated profile.

### POST /api/users/{id}/roles
Replaces the set of roles assigned to the user. Roles are validated against the central catalogue.

- **Auth:** Yes (`role:manage`).
- **Body:** `{ "roles": ["student", "creator"] }`
- **Response 200:** Updated profile.

### DELETE /api/users/{id}/roles/{roleName}
Removes a single role binding.

- **Auth:** Yes (`role:manage`).
- **Response 200:** Updated profile.

### GET /api/roles
Returns the role catalogue along with the capability bundles wired into Casbin.

- **Auth:** Yes (`role:manage`).
- **Response 200:** `{ status, roles: [{ name, label, description, permissions: [{ name, resource, action }] }] }`

### GET /api/admin/overview
RBAC-protected admin dashboard placeholder showing which resource/action pair granted access.

- **Auth:** Yes (`admin:dashboard`, `read`).

### POST /api/email/test
Dispatches either the verification or password-reset template via Nodemailer. Requires email-manage privileges.

### POST /api/uploads/presign
Generates a MinIO presigned URL for uploads/downloads. Requires storage privileges defined in Casbin policies.

### GET /api/health
Base health check returning uptime, dependency status, and CORS configuration.

