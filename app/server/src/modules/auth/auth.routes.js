import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import {
  loginPlaceholder,
  refreshPlaceholder,
} from './auth.controller.js';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Placeholder login endpoint.
 *     description: |
 *       Returns a static success payload until credential validation and token issuance are implemented.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             description: Credentials payload to be defined in a future iteration.
 *     responses:
 *       '200':
 *         description: Login placeholder response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *                 - message
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Login endpoint placeholder
 */
router.post('/auth/login', loginPlaceholder);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Placeholder refresh endpoint.
 *     description: |
 *       Demonstrates token validation via the authenticate middleware. Returns the decoded user payload when available.
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       '200':
 *         description: Refresh placeholder response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *                 - message
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Refresh endpoint placeholder
 *                 user:
 *                   type: object
 *                   nullable: true
 *                   additionalProperties: true
 *       '401':
 *         description: Missing or invalid authentication context.
 */
router.post('/auth/refresh', authenticate, refreshPlaceholder);

export default router;
