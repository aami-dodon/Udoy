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
| GET    | /api/profile/me                  | Returns the authenticated user's profile + preferences.           | Yes  |
| PATCH  | /api/profile/me                  | Updates the authenticated user's profile + preferences.           | Yes  |
| GET    | /api/profile/{userId}            | Admin-moderated access to a user's profile.                       | Yes  |
| PATCH  | /api/profile/{userId}            | Admin updates to a user's profile.                                | Yes  |
| GET    | /api/roles                       | Lists the role catalogue with bundled capabilities.               | Yes  |
| GET    | /api/admin/overview              | RBAC-gated dashboard overview payload.                            | Yes  |
| POST   | /api/email/test                  | Sends a verification or password-reset test email.                | Yes  |
| POST   | /api/uploads/presign             | Generates a MinIO presigned URL for uploads/downloads.            | Yes  |
| GET    | /api/notifications/templates     | Lists notification templates filtered by event/channel/locale.    | Yes  |
| POST   | /api/notifications/templates     | Creates a notification template variant.                          | Yes  |
| GET    | /api/notifications/templates/{id} | Retrieves a notification template by identifier.                  | Yes  |
| PUT    | /api/notifications/templates/{id} | Updates a notification template.                                  | Yes  |
| DELETE | /api/notifications/templates/{id} | Archives a notification template.                                 | Yes  |
| POST   | /api/notifications/dispatch      | Dispatches notifications across the configured channels.          | Yes  |
| GET    | /api/notifications               | Searches notification history with filters.                       | Yes  |
| GET    | /api/notifications/{id}          | Retrieves a notification with delivery logs.                      | Yes  |
| GET    | /api/topics                      | Lists topics with workflow metadata and filtering.                | Yes  |
| POST   | /api/topics                      | Creates a new topic draft with metadata and alignments.           | Yes  |
| GET    | /api/topics/{id}                 | Retrieves a topic draft/version including content blocks.         | Yes  |
| PATCH  | /api/topics/{id}                 | Updates a topic draft's fields, tags, and alignments.             | Yes  |
| POST   | /api/topics/{id}/submit          | Moves a topic draft into the validator review queue.              | Yes  |
| POST   | /api/topics/{id}/review          | Records a validator decision (approve or request changes).        | Yes  |
| POST   | /api/topics/{id}/publish         | Publishes an approved topic to the live catalog.                  | Yes  |
| POST   | /api/topics/{id}/revise          | Creates a new draft revision from a published topic version.      | Yes  |
| GET    | /api/topics/{id}/history         | Returns the version history per language for a topic.             | Yes  |

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
Alternative Response 200 (unverified account):
```json
{ "status": "success", "message": "Please verify your email before requesting a password reset." }
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

### GET /api/profile/me
Returns the authenticated user's profile, preferences, notification settings, and accessibility controls.

Auth: Yes – requires the `user-profile:self-manage` capability.
Params: None.
Query: None.
Body: None.
Response 200:
```json
{
  "status": "success",
  "data": {
    "user": { /* AuthUserProfile */ },
    "profile": {
      "avatarUrl": "https://cdn.udoy.dev/u/avatar.png",
      "bio": "Learning to build robotics for the annual maker fair.",
      "location": "Bengaluru, IN",
      "timezone": "Asia/Kolkata",
      "className": "Grade 8 - Robotics",
      "learningPreferences": {
        "languages": ["English", "Hindi"],
        "topics": ["Robotics", "STEM"],
        "pace": "guided"
      },
      "linkedCoachId": "user_coach_123",
      "subjectExpertise": [],
      "teacherSpecialties": [],
      "coachingSchedule": "Weekdays 16:00-18:00 IST",
      "coachingStrengths": ["confidence building"],
      "organizationName": "",
      "pledgedCredits": null,
      "notificationSettings": {
        "email": true,
        "sms": false,
        "push": true,
        "digest": "daily"
      },
      "accessibilitySettings": {
        "highContrast": false,
        "textScale": "normal",
        "captions": true,
        "screenReaderHints": false
      },
      "createdAt": "2025-11-04T07:00:00.000Z",
      "updatedAt": "2025-11-04T08:12:34.000Z"
    }
  }
}
```
Response 401: Missing or invalid authentication context.

### PATCH /api/profile/me
Updates the authenticated user's profile, enforcing validation on timezone, numeric fields, and allowed role-specific sections.

Auth: Yes – requires the `user-profile:self-manage` capability.
Params: None.
Query: None.
Body:
```json
{
  "bio": "Championing inclusive robotics clubs across my district.",
  "timezone": "Asia/Kolkata",
  "learningPreferences": {
    "topics": ["Robotics", "STEM", "Public speaking"],
    "languages": ["English"],
    "pace": "self-paced"
  },
  "notificationSettings": {
    "email": true,
    "sms": false,
    "push": true,
    "digest": "weekly"
  },
  "accessibilitySettings": {
    "highContrast": true,
    "textScale": "large",
    "captions": true,
    "screenReaderHints": true
  }
}
```
Response 200:
```json
{
  "status": "success",
  "data": {
    "user": { /* AuthUserProfile */ },
    "profile": { /* Updated ProfileResource */ }
  }
}
```
Response 400: Validation failure (e.g., invalid timezone, negative pledged credits).
Response 401: Missing authentication.

### GET /api/profile/{userId}
Fetches profile data for the specified user so administrators can review or moderate personalisation settings.

Auth: Yes – requires the `user-profile:manage` capability.
Params: `userId` (string, required).
Query: None.
Body: None.
Response 200: Same envelope as `GET /api/profile/me`.
Response 401/403: Missing authentication or lacking permission.
Response 404: User not found.

### PATCH /api/profile/{userId}
Applies moderated updates to the specified user's profile.

Auth: Yes – requires the `user-profile:manage` capability.
Params: `userId` (string, required).
Query: None.
Body: Any subset of `ProfileResource` fields, following the same validation rules as the self-service endpoint.
Response 200: Same envelope as `PATCH /api/profile/me`.
Response 400: Validation failure.
Response 401/403: Missing authentication or lacking permission.
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

### GET /api/notifications/templates
Returns notification templates filtered by event key, channel, locale, or activation state.

Auth: Yes – requires `notification.manage`.
Params: None.
Query:
- `eventKey` *(optional string)* – Filter templates matching the event key.
- `channel` *(optional string)* – One of `IN_APP`, `EMAIL`, `SMS`.
- `locale` *(optional string)* – Locale code such as `en` or `en-US`.
- `includeInactive` *(optional boolean)* – When `true`, returns archived templates as well.

Response 200:
```json
{
  "status": "success",
  "data": [
    {
      "id": "tmpl_welcome_en",
      "name": "Welcome Email",
      "eventKey": "user.welcome",
      "channel": "EMAIL",
      "locale": "en",
      "subject": "Welcome to Udoy",
      "body": "<p>Hello {{user.firstName}}</p>",
      "audienceRoles": ["student"],
      "active": true,
      "createdAt": "2024-05-01T10:00:00.000Z",
      "updatedAt": "2024-05-01T10:00:00.000Z"
    }
  ]
}
```

### POST /api/notifications/templates
Creates a new template variant for the specified channel and locale.

Auth: Yes – requires `notification.manage`.
Params: None.
Body:
```json
{
  "name": "Welcome Email",
  "eventKey": "user.welcome",
  "channel": "EMAIL",
  "locale": "en",
  "subject": "Welcome to Udoy",
  "body": "<p>Hello {{user.firstName}}</p>",
  "previewText": "A warm welcome to the platform",
  "audienceRoles": ["student"]
}
```

Response 201: Same envelope as `GET /api/notifications/templates` returning the persisted template.
Response 409: Duplicate combination of event key, channel, and locale.

### GET /api/notifications/templates/{id}
Fetches a template by identifier.

Auth: Yes – requires `notification.manage`.
Params:
- `id` *(path string)* – Template identifier.

Response 200: Template payload as described above.
Response 404: Template missing or archived.

### PUT /api/notifications/templates/{id}
Updates template metadata or content.

Auth: Yes – requires `notification.manage`.
Params:
- `id` *(path string)* – Template identifier.
Body: Same shape as create; omitted fields retain their current values.

Response 200: Updated template payload.
Response 404: Template not found.

### DELETE /api/notifications/templates/{id}
Archives a template so it is skipped during dispatch resolution.

Auth: Yes – requires `notification.manage`.
Params:
- `id` *(path string)* – Template identifier.

Response 200: Template payload with `active: false`.
Response 404: Template not found.

### POST /api/notifications/dispatch
Dispatches notifications for a specific event across the allowed channels.

Auth: Yes – requires `notification.dispatch`.
Params: None.
Body:
```json
{
  "eventKey": "user.welcome",
  "priority": "NORMAL",
  "forceDelivery": false,
  "recipients": [
    {
      "userId": "usr_123",
      "channels": ["EMAIL", "IN_APP"],
      "locale": "en-US",
      "data": { "ctaUrl": "https://app.udoy.com/welcome" },
      "metadata": { "source": "user-management" }
    }
  ]
}
```

Response 202:
```json
{
  "status": "success",
  "data": [
    {
      "status": "fulfilled",
      "notification": {
        "id": "ntf_abc123",
        "eventKey": "user.welcome",
        "channel": "EMAIL",
        "status": "SENT",
        "priority": "NORMAL",
        "userId": "usr_123",
        "recipient": "student@example.com",
        "createdAt": "2024-05-01T10:05:00.000Z"
      }
    }
  ]
}
```
Response 400: Missing event key, recipients, or no eligible channels.
Response 404: Required template variant not found.

### GET /api/notifications
Searches notification history with optional filters.

Auth: Yes – requires `notification.manage`.
Params: None.
Query:
- `status` *(optional string)* – `PENDING`, `SENT`, `DELIVERED`, `FAILED`, etc.
- `channel` *(optional string)* – `EMAIL`, `IN_APP`, `SMS`.
- `eventKey` *(optional string)* – Filter by event key.
- `userId` *(optional string)* – Filter by recipient user id.

Response 200:
```json
{
  "status": "success",
  "data": [
    {
      "id": "ntf_abc123",
      "eventKey": "user.welcome",
      "channel": "EMAIL",
      "status": "SENT",
      "priority": "NORMAL",
      "userId": "usr_123",
      "recipient": "student@example.com",
      "createdAt": "2024-05-01T10:05:00.000Z"
    }
  ]
}
```

### GET /api/notifications/{id}
Returns a specific notification together with its delivery attempt logs.

Auth: Yes – requires `notification.manage`.
Params:
- `id` *(path string)* – Notification identifier.

Response 200:
```json
{
  "status": "success",
  "data": {
    "id": "ntf_abc123",
    "eventKey": "user.welcome",
    "channel": "EMAIL",
    "status": "SENT",
    "priority": "NORMAL",
    "metadata": {
      "channelResponse": { "messageId": "<smtp-id>" }
    },
    "logs": [
      { "status": "SENT", "attempt": 1, "createdAt": "2024-05-01T10:05:01.000Z" }
    ]
  }
}
```
Response 404: Notification not found.

### GET /api/topics
Lists topic drafts, translations, and published versions with workflow metadata.

Auth: Yes – requires `topic.view` (admins may use `topic.manage`).
Query:
- `status` *(optional string)* – Filter by workflow status (`DRAFT`, `IN_REVIEW`, etc.).
- `language` *(optional string)* – Filter by IETF language tag (e.g., `en`, `es`).
- `tag` *(optional string, repeatable)* – Filter by tag name.
- `tagIds` *(optional array<int>)* – Filter by tag identifiers.
- `page`, `pageSize` *(optional integers)* – Pagination controls (default 1/20, max 100).
- `search` *(optional string)* – Full-text match on title/summary.

Response 200:
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "top_123",
        "groupId": "grp_123",
        "language": "en",
        "title": "Solar System Basics",
        "summary": "Overview of the eight planets and dwarf classifications.",
        "status": "IN_REVIEW",
        "version": 2,
        "isLatest": true,
        "metadata": { "readingLevel": "grade-6" },
        "group": {
          "id": "grp_123",
          "defaultLanguage": "en",
          "tags": [
            { "id": 5, "name": "Astronomy", "type": "subject" }
          ],
          "alignments": [
            { "framework": "NGSS", "standardCode": "MS-ESS1-2" }
          ]
        },
        "workflow": [
          { "toStatus": "IN_REVIEW", "createdAt": "2024-10-05T09:00:00.000Z" }
        ]
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

### POST /api/topics
Creates a new topic draft. If `groupId` is omitted, a new topic group is created and the supplied `language` becomes the default language.

Auth: Yes – requires `topic.draft`.
Body:
```json
{
  "groupId": "grp_123",
  "language": "en",
  "title": "Solar System Basics",
  "summary": "Overview of major celestial bodies.",
  "content": { "type": "doc", "content": [] },
  "metadata": { "readingLevel": "grade-6" },
  "accessibility": { "altTextCoverage": "complete" },
  "tags": [
    { "name": "Astronomy", "type": "subject" },
    { "name": "Grade 6", "type": "grade" }
  ],
  "alignments": [
    { "framework": "NGSS", "standardCode": "MS-ESS1-2", "gradeLevel": "6" }
  ]
}
```

Response 201: Returns the full topic payload (see `GET /api/topics/{id}`).
Response 400: Missing title or content.
Response 404: `groupId` specified but not found.

### GET /api/topics/{id}
Returns a single topic (draft or published version) including the block content, tags, alignments, reviews, and workflow events.

Auth: Yes – requires `topic.view`.
Params:
- `id` *(path string)* – Topic identifier.

Response 200: `{ "status": "success", "data": { "topic": { /* Topic */ } } }`
Response 404: Topic not found.

### PATCH /api/topics/{id}
Updates a draft topic. Only topics in `DRAFT` or `CHANGES_REQUESTED` may be edited.

Auth: Yes – requires `topic.draft`.
Body: Any subset of draft fields (`title`, `summary`, `content`, `metadata`, `accessibility`, `tags`, `alignments`).

Response 200: Updated topic envelope.
Response 400: Topic not editable in its current status.

### POST /api/topics/{id}/submit
Moves a draft into review, freezing edits and logging the submitter comment.

Auth: Yes – requires `topic.submit`.
Body (optional):
```json
{ "comment": "Ready for validator review." }
```

Response 200: Topic with status `IN_REVIEW`.
Response 400: Topic is not in a draft state.

### POST /api/topics/{id}/review
Records a validator decision on a topic currently `IN_REVIEW`.

Auth: Yes – requires `topic.review`.
Body:
```json
{
  "decision": "APPROVED",
  "comment": "Aligned with rubric criteria.",
  "metadata": { "rubricScore": 18 }
}
```

Response 200: Updated topic reflecting the new status (`APPROVED` or `CHANGES_REQUESTED`).
Response 400: Invalid decision or topic not in review.

### POST /api/topics/{id}/publish
Publishes an approved topic and records the publisher.

Auth: Yes – requires `topic.publish` (admins may use `topic.manage`).
Body (optional): `{ "comment": "Publishing for curriculum release R2." }`

Response 200: Topic marked as `PUBLISHED` with `publishedAt` timestamp.
Response 400: Topic not approved yet.

### POST /api/topics/{id}/revise
Creates a new draft revision from the specified published topic version. The new draft inherits content, metadata, accessibility, tags, and alignments from the published source.

Auth: Yes – requires `topic.draft`.
Body (optional): `{ "notes": "Update media assets for 2025 edition." }`

Response 201: Newly created draft revision.
Response 400: Revision already exists or source topic not published.

### GET /api/topics/{id}/history
Returns the full version history for the topic’s language, ordered by latest version first.

Auth: Yes – requires `topic.view`.
Params: `id` *(path string)* – Any topic identifier within the language chain.

Response 200: `{ "status": "success", "data": { "history": [ /* Topic[] */ ] } }`
Response 404: Topic not found.
