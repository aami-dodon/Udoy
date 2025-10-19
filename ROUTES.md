# Client Route Catalog

## Overview
- All SPA routes must be listed in the table below.
- Add new rows when introducing routes and ensure descriptions stay in sync with the implementation.

## Routes
| Path | Feature | Description |
| --- | --- | --- |
| `/` | Landing | Inspirational marketing landing page introducing the Udoy mission, ecosystem, and key CTAs. |
| `/health` | Health Check | Operational dashboard that pings `/api/health` and offers test email tooling. |
| `/theme` | Theme Showcase | Central theme catalog displaying shared tokens and components for developers. |
| `/403` | Error Pages | Forbidden access screen that guides users back to the home experience. |
| `/500` | Error Pages | Server error page surfaced when upstream systems fail unexpectedly. |
| `/error` | Error Pages | Generic fallback error experience shared by the global error boundary. |
| `*` | Error Pages | Catch-all 404 route rendering the branded “page not found” state. |
