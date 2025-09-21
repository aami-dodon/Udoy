# Controllers

Controllers accept validated HTTP input, call services, and format the HTTP response.

- `hello.controller.js` returns a simple "Hello World" message and is the template for future controllers.
- `auth.controller.js` handles signup, login, and profile retrieval by delegating to the auth service and returning JWT tokens.
