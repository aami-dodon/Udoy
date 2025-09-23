import { Router } from 'express';
import { body } from 'express-validator';
import { registerHandler, loginHandler } from './auth.controller.js';

export const authRouter = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 */
authRouter.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').isString(),
    body('lastName').isString(),
    body('role').isIn(['student', 'teacher', 'admin']),
    body('classLevel').optional().isInt({ min: 4, max: 8 }),
  ],
  registerHandler
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate user
 */
authRouter.post(
  '/login',
  [body('email').isEmail(), body('password').isString()],
  loginHandler
);
