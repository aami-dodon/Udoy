# User Story 03 - Delivery Failure and Retry

## As a
System

## I want to
retry failed email deliveries

## So that
messages eventually reach recipients.

## Acceptance Criteria
- Retry policy with exponential backoff
- Max attempts and escalation to admins
- Failure reasons recorded
- Idempotent retries without duplicates

## Definition of Done
- Tests passed
- Reviewed and merged
- Deployed to staging

## Linked Feature
[NS / Email Templates & Delivery](../feature-spec.md)
