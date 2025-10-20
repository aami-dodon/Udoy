# Client Route Catalog

## Overview
- All SPA routes must be listed in the table below.
- Add new rows when introducing routes and ensure descriptions stay in sync with the implementation.

## Routes
| Path | Feature | Description |
| --- | --- | --- |
| `/` | Home | Minimal home route rendering the "hello world" placeholder content. |
| `/health` | Health Dashboard | Surfaces live service health metrics fetched from `/api/health`, including dependency and CORS checks. |
| `/login` | Auth | Email + password login form that hydrates the new AuthProvider context and redirects to `/dashboard`. |
| `/register` | Auth | Student/guardian registration form that wires into the guardian approval + email verification flows. |
| `/forgot-password` | Auth | Collects an email address and triggers the password reset email workflow. |
| `/reset-password` | Auth | Accepts a reset token + new password to finalize credential recovery. |
| `/verify-token` | Auth | Handles email verification and guardian approval tokens with contextual messaging. |
| `/verify-email` | Auth | Alias route for verification emails so emailed links resolve without 404s. |
| `/dashboard` | Dashboard | Authenticated account hub showing RBAC roles, permissions, and session controls. |
| `/admin/users` | Admin | Platform admin panel for listing users, toggling roles, and managing lifecycle states. |
| `/403` | Error Pages | Forbidden access screen that guides users back to the home experience. |
| `/500` | Error Pages | Server error page surfaced when upstream systems fail unexpectedly. |
| `/error` | Error Pages | Generic fallback error experience shared by the global error boundary. |
| `*` | Error Pages | Catch-all 404 route rendering the branded “page not found” state. |
