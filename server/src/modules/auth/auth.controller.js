import { validationResult } from 'express-validator';
import { registerUser, loginUser } from './auth.service.js';

export const registerHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await registerUser(req.body);
    return res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    return next(error);
  }
};

export const loginHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { user, token } = await loginUser(req.body.email, req.body.password);
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    return next(error);
  }
};
