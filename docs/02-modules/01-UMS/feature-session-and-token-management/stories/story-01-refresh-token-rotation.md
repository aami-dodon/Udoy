# User Story 01 - Refresh Token Rotation

## As a
System

## I want to
rotate refresh tokens on use

## So that
sessions remain secure and token theft risk is reduced.

## Acceptance Criteria
- New refresh token issued on each refresh
- Old refresh token invalidated immediately
- Reuse detection triggers session invalidation
- All events logged with user and device metadata

## Definition of Done
- Tests passed
- Reviewed and merged
- Deployed to staging

## Linked Feature
[UMS / Session & Token Management](../feature-spec.md)

