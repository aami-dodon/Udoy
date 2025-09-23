# Account Module

- Routes: `account.routes.js` mounts under `/api/account` and guards account-setting updates.
- Controller: `account.controller.js` orchestrates request validation and payload shaping.
- Service: `account.service.js` performs account-setting updates, email change issuance, and notification triggers.
- Validation: `account.validation.js` enforces account payload rules.
