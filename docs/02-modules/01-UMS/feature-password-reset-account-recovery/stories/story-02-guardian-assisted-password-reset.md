# User Story 02 - Guardian-Assisted Password Reset

## As a
Guardian

## I want to
initiate and approve a password reset for my linked minor's account

## So that
the learner can regain access while the process stays compliant with guardian oversight policies.

## Acceptance Criteria
- Guardian must authenticate and pass required secondary verification before initiating a reset
- Guardian can select from their linked learner accounts and submit a reset request with a reason
- System issues a temporary reset link or code to the guardian, which must be confirmed before the learner can sign in again
- All guardian-mediated resets are recorded in the audit log with timestamp, actor, learner, and justification
- Notifications are sent to both the guardian and learner (where contact info exists) summarizing the action and next steps

## Definition of Done
- Tests passed
- Reviewed and merged
- Deployed to staging

## Linked Feature
[UMS / Password Reset & Recovery](../feature-spec.md)

