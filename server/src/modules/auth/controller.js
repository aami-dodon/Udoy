import { validationResult } from 'express-validator';
import { registerUser, authenticateUser } from './service.js';

/**
 * Handle user registration request.
 */
export async function register(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const user = await registerUser(req.body);
    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle login requests returning JWT tokens.
 */
export async function login(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { token, user } = await authenticateUser(req.body);
    return res.json({ token, user });
  } catch (error) {
    error.status = 401;
    return next(error);
  }
}
