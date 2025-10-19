# Client Route Catalog

## Overview
- All SPA routes must be listed in the table below.
- Add new rows when introducing routes and ensure descriptions stay in sync with the implementation.

## Routes
| Path | Feature | Description |
| --- | --- | --- |
| `/` | Home | Minimal home route rendering the "hello world" placeholder content. |
| `/403` | Error Pages | Forbidden access screen that guides users back to the home experience. |
| `/500` | Error Pages | Server error page surfaced when upstream systems fail unexpectedly. |
| `/error` | Error Pages | Generic fallback error experience shared by the global error boundary. |
| `*` | Error Pages | Catch-all 404 route rendering the branded “page not found” state. |
