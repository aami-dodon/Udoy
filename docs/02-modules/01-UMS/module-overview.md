Implement/Code below in both client and server code, and wire them together. You must follow the Guidelines present in AGENTS.MD present at the root of repo.



# UMS — User Management System  

**Goal:** Provide a robust, secure, and compliant user identity, registration, authentication, authorization, and session management layer with role-based access control (RBAC).

---

## 1. System Responsibilities
- Centralized user identity and access management.  
- Role-based access control for multiple user types and mixed-role accounts.  
- Support for intermittent connectivity (token/session extension).  
- Guardian/coach support for minors.  
- Secure and compliant onboarding and session flows.

---

## 2. User Roles & Core Permissions

| Role                  | Capabilities                                                                                                                                                          |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Platform Admin**       | - Tenant provisioning<br>- User/role CRUD operations<br>- Permission management<br>- Audit log review and security incident escalation                                  |
| **Student**              | - Self or guardian-assisted registration<br>- Profile management<br>- Content consumption<br>- Assignment submission<br>- Progress tracking                             |
| **Creator**              | - Content publishing and maintenance<br>- Draft workflows<br>- Validator collaboration                                                                                 |
| **Validator/Reviewer**   | - Content review & approval<br>- Compliance checklist maintenance<br>- Quality control                                                                                 |
| **Coach/Guardian**       | - Onboarding support for Students<br>- Monitoring student progress<br>- Credential reset (minors)                                                                      |
| **Sponsor/Partner**      | - Cohort management<br>- Aggregated analytics view<br>- Billing contact management                                                                                     |

> **Note:** Roles map to RBAC capability bundles. Mixed-role accounts are additive (e.g., Creator + Validator).

---

## 3. Core Flows

### 3.1 Registration & Onboarding
- Self or guardian-assisted registration  
- Email verification → account creation → role assignment → first login

### 3.2 Authentication
- Login/Logout  
- Token issuance, rotation, and session extension  
- Re-authentication triggers for sensitive actions

### 3.3 Account Recovery
- Password reset & identity verification  
- Credential update workflows  
- Guardian/coach flows for minors

### 3.4 Admin Lifecycle
- Account activation/deactivation  
- Full audit trail

### 3.5 Authorization
- RBAC checks applied at:
  - API endpoints  
  - UI routes  
  - Feature access gates

---

## 4. High-Level Feature Set
- Secure registration and login with age-appropriate flows  
- Role-based access control for all user types  
- Password reset and account recovery  
- Admin account lifecycle management (activation/deactivation)  
- Session and token management (refresh, expiry, offline tolerance)  
- Email verification with guardian/coach support

---

## 5. Functional Requirements
- CRUD for users and roles (create, read, update, deactivate)  
- Assign/remove roles and permissions  
- Authenticate with email-verified accounts  
- Token refresh & session management  
- Password reset with secure verification  
- Centralized RBAC enforcement (API + UI)  
- Audit logging of:
  - User lifecycle events  
  - Role/permission changes

---

## 6. Non-Functional Requirements
### Security
- Strong password hashing  
- Transport encryption  
- Brute-force protection  
- CSRF / SSRF mitigation

### Privacy & Compliance
- Guardian consent flows for minors  
- CSS alignment

### Reliability
- Offline/intermittent connectivity support  
- Idempotent sync and replay

### Performance
- Auth API latency targets  
- Rate limiting and lockout

### Observability
- Metrics: login attempts, failures, lockouts  
- Structured audit trails

---

## 7. Implementation Guidelines
- Use a modular RBAC system with capability bundles.  
- Centralize auth and role checks (avoid scattering logic).  
- Ensure extensibility for new roles and permissions.  
- All flows must be API-driven to allow integration with downstream services.  
- Maintain a structured audit trail for compliance and debugging.  
- Design for offline-tolerant session handling.

---

## Deliverables
1. Implement RBAC layer with role + capability mapping.  
2. Build registration and authentication endpoints.  
3. Integrate token/session lifecycle management.  
4. Add guardian-assisted flows for minors.  
5. Set up audit logging and observability hooks.  
6. Enforce security, privacy, and compliance requirements.