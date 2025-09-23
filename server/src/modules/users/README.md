# Users Module

Admin endpoints for listing, updating, and deleting user accounts. Routes are protected via `requireRoles('admin')` middleware and respond with trimmed profile metadata.
