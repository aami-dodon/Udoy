# Routes

- All backend routes should be composed under `src/app.js`.
- Feature modules expose an Express router from `<feature>.routes.js`.
- `hello.routes.js` mounts at `/api/hello` and demonstrates the pattern for future modules.
- `auth.routes.js` mounts at `/api/auth` for signup, login, and profile endpoints.
