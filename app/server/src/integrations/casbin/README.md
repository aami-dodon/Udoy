# Casbin Policy Overview

This document captures the initial role-based access control (RBAC) policy enforced by Casbin within the Udoy server.

## Request Model
- **Subject (`sub`)** – resolved from the authenticated JWT payload (`req.user.role`, `req.user.email`, or `req.user.id`).
- **Object (`obj`)** – logical resource identifier supplied when attaching the authorization middleware (for example, `admin:dashboard`).
- **Action (`act`)** – verb that represents the attempted operation (for example, `read`, `write`).

## Default Policy Rules
| Subject | Object | Action | Purpose |
| --- | --- | --- | --- |
| `admin` | `admin:dashboard` | `read` | Allows administrators to load the admin overview endpoint. |
| `admin` | `admin:settings` | `write` | Reserves administrative settings mutations for admins. |
| `auditor` | `admin:dashboard` | `read` | Permits auditors to inspect dashboard data without modification privileges. |

## Role Assignments
| User Identifier | Role |
| --- | --- |
| `admin@example.com` | `admin` |
| `auditor@example.com` | `auditor` |

> When integrating with real data, manage assignments via the Casbin policy (or migrate to a persistent adapter such as Prisma) to keep user-role mappings in sync with application state.
