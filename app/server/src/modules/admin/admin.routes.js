import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { getAdminOverview } from './admin.controller.js';

const router = Router();

/**
 * @openapi
 * /api/admin/overview:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Retrieve the admin dashboard overview payload.
 *     description: |
 *       Returns a placeholder response that echoes the authenticated principal and the
 *       permissions required to load the admin dashboard. The payload will be extended when
 *       real analytics and management data is connected.
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the admin overview placeholder payload.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminOverviewResponse'
 *       '401':
 *         description: Missing or invalid authentication context.
 *       '403':
 *         description: Authenticated user lacks the `admin:dashboard` permission.
 */
router.get(
  '/admin/overview',
  authenticate,
  authorize({ resource: 'admin:dashboard', action: 'read' }),
  getAdminOverview
);

export default router;
