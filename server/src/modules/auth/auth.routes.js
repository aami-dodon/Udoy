import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.js';
import {
  forgotPasswordRateLimiter,
  loginRateLimiter,
  resetPasswordRateLimiter,
  signupRateLimiter
} from '../../middlewares/rateLimiter.js';
import { validate } from '../../middlewares/validate.js';
import {
  forgotPasswordController,
  loginController,
  meController,
  resetPasswordController,
  resendVerificationController,
  signupController,
  verifyEmailController
} from './auth.controller.js';
import {
  emailOnlyValidation,
  loginValidation,
  resetPasswordValidation,
  signupValidation
} from './auth.validation.js';

const router = Router();

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/signup', signupRateLimiter, validate(signupValidation), signupController);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Authentication successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginRateLimiter, validate(loginValidation), loginController);

/**
 * @openapi
 * /api/auth/verify/{token}:
 *   get:
 *     summary: Verify email address
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid token
 */
router.get('/verify/:token', verifyEmailController);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent if the account exists
 */
router.post(
  '/forgot-password',
  forgotPasswordRateLimiter,
  validate(emailOnlyValidation),
  forgotPasswordController
);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset account password using token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid reset token
 */
router.post(
  '/reset-password',
  resetPasswordRateLimiter,
  validate(resetPasswordValidation),
  resetPasswordController
);

/**
 * @openapi
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend email verification token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email resent if account exists
 */
router.post(
  '/resend-verification',
  forgotPasswordRateLimiter,
  validate(emailOnlyValidation),
  resendVerificationController
);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get authenticated account details
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the authenticated user
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, meController);

export const authRoutes = router;
