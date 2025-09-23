import { Router } from 'express';

import { authorizeRoles, authenticate } from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import { ROLES } from '../../../../../shared/constants/index.js';
import {
  deleteUserController,
  listUsersController,
  updateUserController
} from './users.controller.js';
import {
  deleteAdminUserValidation,
  updateAdminUserValidation
} from './users.validation.js';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.ADMIN));

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: List every user (including inactive and deleted)
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Collection of user records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *                       role:
 *                         type: string
 *                         enum: [student, teacher, admin]
 *                       isVerified:
 *                         type: boolean
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       passwordUpdatedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 */
router.get('/', listUsersController);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update an existing user
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, teacher, admin]
 *               isVerified:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated user record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum: [student, teacher, admin]
 *                     isVerified:
 *                       type: boolean
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     passwordUpdatedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       400:
 *         description: Invalid request
 *       404:
 *         description: User not found
 */
router.put('/:id', validate(updateAdminUserValidation), updateUserController);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Soft delete a user account
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *                     isActive:
 *                       type: boolean
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       404:
 *         description: User not found
 */
router.delete('/:id', validate(deleteAdminUserValidation), deleteUserController);

export const adminUserRoutes = router;
