# Role-Based Access Control (RBAC)

This document captures Udoy's RBAC model, which is enforced through the Casbin policy engine on the server. It describes the standard roles, their capabilities, and the workflow developers should follow when extending or updating access control.

## RBAC Overview

- **Authorization layer**: [Casbin](https://casbin.org/) with the RBAC model defined under `app/server/src/integrations/casbin` (`model.conf`, `policy.csv`, and the `getEnforcer` loader).
- **Source of truth**: Role and permission definitions are codified in `app/server/src/services/rbacService.js` and synchronized with both the database and the in-memory Casbin enforcer at runtime.
- **Resource naming**: Permissions are scoped as `<resource>.<capability>` and resolve to Casbin policies using `<resource>:<action>` pairs. This ensures parity between Prisma records, business logic, and Casbin enforcement.

## Standard Roles and Capabilities

| Role | Description | Core Permissions |
| --- | --- | --- |
| **Admin** | Platform administrator with full control over tenant operations, security, and RBAC management. | `tenant.provision`, `user.manage`, `role.manage`, `permission.manage`, `audit-log.view`, `security.escalate`, `session.invalidate`, `admin.dashboard`, `profile.manage`, `notification.manage`, `notification.dispatch`, `topic.manage`, `topic.publish`, `topic.view`. |
| **Student** | Learner focused on coursework consumption and submissions. | `profile.self`, `content.consume`, `assignment.submit`, `progress.view`. |
| **Creator** | Author responsible for drafting and publishing curriculum content. | `profile.self`, `content.draft`, `content.publish`, `teacher.collaborate`, `topic.draft`, `topic.submit`, `topic.publish`, `topic.view`. |
| **Teacher** | Educator reviewing and aligning content with standards. | `profile.self`, `content.review`, `curriculum.align`, `quality.assure`, `topic.review`, `topic.approve`, `topic.requestChanges`, `topic.view`. |
| **Coach** | Mentor guiding learners through onboarding and progress tracking. | `profile.self`, `student.onboard`, `student.monitor`, `credential.support`. |
| **Sponsor** | Sponsor partner managing cohorts, analytics, and billing relationships. | `profile.self`, `cohort.manage`, `analytics.view`, `billing.manage`. |

Each permission maps to a Casbin policy rule using the `resource` and `action` properties maintained in the service layer, ensuring that role changes propagate consistently across Prisma, HTTP middleware, and authorization checks.

## Developer Workflow

Follow these steps whenever you need to introduce new roles or adjust permissions:

1. **Update role definitions**
   - Modify `ROLE_DEFINITIONS` in `app/server/src/services/rbacService.js` to add or adjust roles and their permissions.
   - Ensure each permission includes a unique `name`, `resource`, `action`, and human-readable `description`.

2. **Synchronize Casbin policies**
   - The `ensureCoreRbac` helper automatically aligns Prisma roles/permissions and the Casbin policy using `syncRolePolicies`.
   - After updating definitions, trigger the synchronization path (for example during server startup or via the maintenance script that calls `ensureCoreRbac`) so the changes reach both the database and `policy.csv`-backed enforcer state.

3. **Adjust seed policy if necessary**
   - For default assignments in non-production environments, update `app/server/src/integrations/casbin/policy.csv` and document the rationale in `app/server/src/integrations/casbin/README.md`.
   - Maintain parity between seed users (e.g., `admin@example.com`, `auditor@example.com`) and the role catalogue.

4. **Document and communicate**
   - Record notable RBAC changes in `CHANGELOG.md` with an IST timestamp.
   - Update API and route documentation (`API-SPECS.md`, `ROUTES.md`) if access adjustments affect exposed surfaces.

5. **Test authorization paths**
   - Exercise critical endpoints with representative JWTs to validate that Casbin allows intended traffic and blocks unauthorized actions.
   - Monitor logs from `authorize` middleware for denials or misconfigurations and adjust policies accordingly.

Keeping the Casbin model, Prisma entities, and service layer definitions synchronized ensures deterministic RBAC enforcement across environments.
