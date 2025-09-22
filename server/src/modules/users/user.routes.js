import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.js';
import { updateProfileController } from './user.controller.js';

const router = Router();

/**
 * @openapi
 * /api/users/me:
 *   put:
 *     summary: Update authenticated user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               currentPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/me', authenticate, updateProfileController);

export const userRoutes = router;
