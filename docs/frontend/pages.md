# Pages

- Feature pages live in `src/features/<feature>/pages`.
- `HelloPage` fetches API data from `/api/hello`, renders the `HelloMessage` component, and now signposts auth entry points.
- `LoginPage` and `SignupPage` wrap the auth forms and provide navigation between them.
- `DashboardPage` is a protected view that greets the authenticated user and surfaces role-specific messaging (including an admin summary when the seeded admin logs in).
