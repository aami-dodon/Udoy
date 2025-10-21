# NS — Notification System

## System Overview
Unified communication hub for automated platform alerts and informational messages. Provides templated, multi-language, multi-channel delivery with logging and delivery tracking.

## Target Users and Roles
- Admins: Configure templates, channels, and delivery policies.
- All users: Receive relevant notifications per role and preferences.

## Flows
- Event from User Management System(Already Implemented), Profile Management System (Already Implemented) (/LMS/CrMS/TMS/GS/FSS - To be Implemented) ( → template + channel resolution → localization → send (in-app/email/optional SMS {to be implemented later}) → log + track delivery → retries/escalation.
- Preference checks from Profile Management System (Already implemented) → throttle and schedule as configured.
- Failure handling → retry with backoff → alert admins on persistent errors.

## High-level Features

- Role-based triggers for key events.
- Email delivery with reusable templates.
- Multi-language and multi-channel support (in-app, email; optional SMS for guardians).
- Logging and delivery tracking.

## Functional vs Non-functional Requirements
- Functional requirements
  - Event subscriptions from core systems; idempotent processing.
  - Template variables and localization; per-role content variants.
  - Channel routing, scheduling, and retries; respect user preferences.
  - Delivery status tracking and searchable logs.

- Non-functional requirements
  - High deliverability and throughput with backpressure controls.
  - Privacy-preserving payloads; avoid exposing student PII to sponsors.
  - Localization coverage and right-to-left considerations.
  - Reliability: retries, dead-letter queues, idempotency keys.
  - Auditability for compliance and incident reviews.

## Notes
- Email is already configured and working for User Management System but without any branded templates
- The Syling is shared hence re-use the same.
