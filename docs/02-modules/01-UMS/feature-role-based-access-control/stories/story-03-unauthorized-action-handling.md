# User Story 03 - Unauthorized Action Handling

## As a
System

## I want to
block unauthorized API/UI actions consistently

## So that
security and compliance are enforced.

## Acceptance Criteria
- 403/401 responses include standard error payloads
- Frontend displays consistent messaging and redirects
- Attempts logged with user, route, and timestamp
- Rate limiting applied on repeated violations

## Definition of Done
- Tests passed
- Reviewed and merged
- Deployed to staging

## Linked Feature
[UMS / Role-based Access Control](../feature-spec.md)
