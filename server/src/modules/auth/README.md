# Auth Module

Handles user registration and login across roles. Exposes `/api/auth/register` and `/api/auth/login` endpoints. Passwords are hashed with bcrypt and JWT tokens are issued with 24 hour expiry.
