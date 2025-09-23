# Controllers

Controllers accept validated HTTP input, call services, and format the HTTP response.

- `hello.controller.js` returns a simple "Hello World" message and is the template for future controllers.
- `auth.controller.js` now covers signup, login, account retrieval, email verification, password recovery, and resend actions while keeping responses generic for security.
- `account.controller.js` exposes the authenticated account update endpoint, orchestrating sensitive-field reauthentication checks.
- `admin/users.controller.js` provides list/edit/deactivate/delete actions for admin dashboards and triggers the appropriate email notifications.
