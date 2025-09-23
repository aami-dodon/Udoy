import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { updateAccountController } from './account.controller.js';
import { updateAccountValidation } from './account.validation.js';

const router = Router();

/**
 * @openapi
 * /api/account:
 *   put:
 *     summary: Update authenticated account settings
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
 *         description: Account settings updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/', authenticate, validate(updateAccountValidation), updateAccountController);

export const accountRoutes = router;
