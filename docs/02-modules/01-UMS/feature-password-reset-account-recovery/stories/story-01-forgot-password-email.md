# User Story 01 - Forgot Password via Email

## As a
User

## I want to
reset my password using a secure email link

## So that
I can regain access to my account.

## Acceptance Criteria
- Password reset link sent only to the user's verified email address
- Reset flow requires the user to confirm delivery by following the verification link before choosing a new password
- Rate limiting enforced on password reset requests and link generation to mitigate abuse
- Verification link expires after the configured time window and is single-use
- New password must meet all policy requirements
- Clear error messaging for expired, invalid, or already-used links

## Definition of Done
- Tests passed
- Reviewed and merged
- Deployed to staging

## Linked Feature
[UMS / Password Reset & Recovery](../feature-spec.md)

