import { Router } from 'express';
import { sendTestEmail } from './email.controller.js';

const router = Router();

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
 */
router.post('/email/test', sendTestEmail);

export default router;
