import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { updateProfileController } from './account.controller.js';
import { updateProfileValidation } from './account.validation.js';

const router = Router();

/**
 * @openapi
 * /api/account/profile:
 *   put:
 *     summary: Update authenticated user profile
 *     tags:
 *       - Account
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
router.put('/profile', authenticate, validate(updateProfileValidation), updateProfileController);

export const accountRoutes = router;
