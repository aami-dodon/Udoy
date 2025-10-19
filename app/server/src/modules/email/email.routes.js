import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { sendTestEmail } from './email.controller.js';

const router = Router();

const HTTP_METHOD_TO_ACTION = {
  GET: 'read',
  POST: 'write',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

/**
 * @openapi
 * /api/email/test:
 *   post:
 *     tags:
 *       - Email
 *     summary: Send a transactional template in test mode.
 *     description: |
 *       Triggers either the verification or password reset template using the configured
 *       Nodemailer transport. The endpoint is intended for manual verification of template
 *       rendering during development.
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailTestRequest'
 *     responses:
 *       '200':
 *         description: Email was queued and dispatched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailTestResponse'
 *       '400':
 *         description: Validation error such as a missing `to` recipient address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Missing or invalid authentication context.
 *       '403':
 *         description: Authenticated user lacks the `email:test` permission for the relevant action.
 */
router.post(
  '/email/test',
  authenticate,
  authorize({
    resource: 'email:test',
    action: (req) => HTTP_METHOD_TO_ACTION[req.method?.toUpperCase()] || 'write',
  }),
  sendTestEmail
);

export default router;
