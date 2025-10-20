# Story: Role-specific onboarding and login

## Summary
As a UMS product owner I need every defined role to have an explicit onboarding and login experience so that each persona receives the right capabilities and security posture.

## Actors
- Platform Admin
- Creator
- Validator/Reviewer
- Coach/Guardian
- Sponsor/Partner

## Preconditions
- Base UMS services (registration API, login API, RBAC service) are available.
- Email delivery, MFA provider, and guardian-consent services are configured.

## Main Flow
1. Admin invites new Creator, Validator, and Sponsor accounts via the Admin console.
2. Invitation emails contain role-specific requirements (portfolio upload for Creator, compliance checklist for Validator, organization verification for Sponsor).
3. Each invitee completes registration forms tailored to their role and sets credentials (with MFA enforced for elevated roles).
4. Admin provisioning workflow assigns RBAC bundles for each role.
5. Newly onboarded users log in and reach their respective dashboards with contextual welcome guidance.
6. Coaches/Guardians accept delegated access from Students and confirm relationships before accessing student data.

## Alternate/Edge Cases
- Sponsor requests multiple seats: system captures billing contact and cohort association during registration.
- Creator attempts to log in before Validator approval: access is blocked with status messaging.
- Admin disables a Validator: subsequent login attempts require re-activation workflow.

## Acceptance Criteria
- Role-specific form fields, validations, and consent requirements are documented.
- Invitation and approval states are tracked in audit logs.
- Successful login routes each role to an appropriate landing page respecting RBAC.
- Error messaging covers pending approval, suspended accounts, and missing consent artifacts.
