# Client Architecture

- **Routing** handled in `client/src/routes/AppRoutes.jsx` via React Router v6.
- **State** managed with React Context in `client/src/providers/AuthProvider.jsx` and feature-level hooks.
- **UI** built with Material UI components and theming configured in `client/src/theme/index.js`.
- **Data Fetching** centralized through `client/src/lib/apiClient.js` which injects JWT tokens and handles errors.
- **Features** live under `client/src/features` mirroring backend modules:
  - `auth`
  - `users`
  - `academics`
  - `dashboard`
