# Pages

- Feature pages live in `src/features/<feature>/pages`.
- `HelloPage` fetches API data from `/api/hello`, renders the `HelloMessage` component, and now signposts auth entry points.
- `LoginPage` and `SignupPage` wrap the auth forms and provide navigation between them. `LoginPage` also surfaces resend verification when the backend rejects unverified logins.
- `ForgotPasswordPage`, `ResetPasswordPage`, and `VerifyEmailPage` guide learners and teachers through recovery and verification flows (the verification page can resend links when tokens expire).
- `DashboardPage` is a protected view that greets the authenticated user, surfaces role-specific messaging, and links to profile/admin utilities.
- `ProfilePage` (in `features/account/pages`) allows authenticated users to update names, emails (with re-verification), and passwords.
- `AdminUsersPage` lists all accounts, enabling admins to edit, deactivate, or delete users with inline dialogs.
