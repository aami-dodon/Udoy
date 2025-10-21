# Client Route Catalog

## Overview
- All SPA routes must be listed in the table below.
- Add new rows when introducing routes and ensure descriptions stay in sync with the implementation.

## Routes
| Path | Feature | Access | Description |
| --- | --- | --- | --- |
| `/` | Home | Public | Minimal home route rendering the "hello world" placeholder content. |
| `/health` | Health Dashboard | Public | Surfaces live service health metrics fetched from `/api/health` and provides a transactional email test harness wired to `/api/email/test`. |
| `/login` | Auth | Public | Email + password login form that hydrates the AuthProvider context and redirects to `/dashboard` after successful authentication. |
| `/register` | Auth | Public | Student registration form that triggers coach approval for minors and email verification workflows. |
| `/forgot-password` | Auth | Public | Collects an email address and requests a password reset message from the backend. |
| `/reset-password` | Auth | Public | Accepts the reset token (via query string) and new password to finalize credential recovery. |
| `/verify-token` | Auth | Public | Handles verification and coach approval tokens with contextual messaging based on API responses. |
| `/verify-email` | Auth | Public | Alias of `/verify-token` so emailed verification links resolve without 404s. |
| `/dashboard` | Dashboard | Authenticated | Protected account hub (via `RequireAuth`) showing RBAC roles, permissions, and session controls. |
| `/profile` | Profile | Authenticated | Profile management hub enabling users to update avatars, preferences, notifications, and accessibility settings. |
| `/topics` | Topics | Creator / Validator / Admin | Workflow dashboard listing topic drafts, translations, and publication status. |
| `/topics/new` | Topics | Creator & Admin | Draft authoring studio with TipTap, tagging, and curriculum alignment controls. |
| `/topics/:id` | Topics | Creator / Validator / Admin | Detailed topic view with review actions, metadata, and version history. |
| `/topics/:id/edit` | Topics | Creator & Admin | Edit an existing topic draft with media uploads and metadata management. |
| `/admin/users` | Admin | Admin role | Guarded by `RequireRole('admin')`; lists users, updates statuses, and manages role bindings. |
| `/403` | Error Pages | Public | Forbidden access screen that guides users back to the home experience. |
| `/500` | Error Pages | Public | Server error page surfaced when upstream systems fail unexpectedly. |
| `/error` | Error Pages | Public | Generic fallback error experience shared by the global error boundary. |
| `*` | Error Pages | Public | Catch-all 404 route rendering the branded “page not found” state. |
