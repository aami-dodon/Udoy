import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
  guardianApproval,
  getCurrentSession,
} from './auth.controller.js';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user account.
 *     description: |
 *       Creates a new user record, assigns the student role, and dispatches verification emails. If the registrant is a minor,
 *       a guardian approval flow is initiated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegistrationRequest'
 *     responses:
 *       '201':
 *         description: Registration completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRegistrationResponse'
 *       '400':
 *         description: Invalid payload.
 */
router.post('/auth/register', register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Authenticate using email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *     responses:
 *       '200':
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       '401':
 *         description: Invalid credentials.
 */
router.post('/auth/login', login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh the access token using a refresh token.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Refreshed token pair.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRefreshResponse'
 *       '401':
 *         description: Missing or invalid refresh token.
 */
router.post('/auth/refresh', refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Revoke the active session and clear auth cookies.
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       '200':
 *         description: Logout successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StandardSuccessResponse'
 *       '401':
 *         description: Authentication required.
 */
router.post('/auth/logout', authenticate, logout);

/**
 * @openapi
 * /api/auth/verify-email:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify a user's email address using a token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Email verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthVerificationResponse'
 */
router.post('/auth/verify-email', verifyEmail);

/**
 * @openapi
 * /api/auth/resend-verification:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Re-send the email verification link.
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
 *       '200':
 *         description: Verification email dispatched if the account exists.
 */
router.post('/auth/resend-verification', resendVerification);

/**
 * @openapi
 * /api/auth/request-password-reset:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Initiate a password reset flow.
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
 *       '200':
 *         description: Password reset instructions sent if the account exists.
 */
router.post('/auth/request-password-reset', requestPasswordReset);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Complete a password reset using a verification token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthResetPasswordRequest'
 *     responses:
 *       '200':
 *         description: Password reset successfully.
 */
router.post('/auth/reset-password', resetPassword);

/**
 * @openapi
 * /api/auth/guardian/approve:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Approve or revoke guardian consent for a student.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *               approve:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       '200':
 *         description: Guardian action recorded.
 */
router.post('/auth/guardian/approve', guardianApproval);

/**
 * @openapi
 * /api/auth/session:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Retrieve the authenticated user's session context.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Current session details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSessionResponse'
 *       '401':
 *         description: Authentication required.
 */
router.get('/auth/session', authenticate, getCurrentSession);

export default router;
