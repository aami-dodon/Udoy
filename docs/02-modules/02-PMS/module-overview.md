# PMS — Profile Management System

## System Overview
Enables users to personalize and manage profile information and preferences. Tied to UMS identity; feeds personalization and accessibility signals into LMS, Notification System, and Compliance functions.

## Target Users and Roles
- All users: Manage their profile information, inlcuding avatars and preferences.
- Admins: Moderate, edit, or mask sensitive data for child safety.

## Flows
- Update profile details → validate inputs → save → propagate to dependent systems.
- Change learning preferences (language, topics, pace) → apply personalization in LMS.
- Update notification and accessibility settings → respected by NS and UI.
- Admin moderation on flagged content → approve/edit/reject with audit trail.

## High-level Features
- Profile picture, bio, and contact details.
- Learning preferences (language, topics, pace).
- Notification and accessibility settings.
- Admin moderation and edit controls.

## Functional vs Non-functional Requirements
- Functional requirements
  - CRUD for profile fields with validation and per-field visibility rules.
  - Preferences storage and exposure to LMS/NS via stable contracts.
  - Admin moderation workflows; redact or lock fields for minors.
  - Audit logging for changes and moderation decisions.
- Non-functional requirements
  - Privacy by design; minimal data collection; COPPA/child-safety alignment with CSS.
  - Accessibility-first inputs and previews; localization of fields and options.
  - Data integrity and validation (format, size, content safety checks).
  - Performance: low-latency reads; cache safe, write-through updates.
  - Observability: change metrics and moderation outcomes.

