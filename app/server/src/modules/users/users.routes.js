import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import {
  listUsers,
  getUser,
  updateUser,
  setUserRoles,
  removeUserRoleBinding,
  listRoleCatalog,
} from './users.controller.js';

const router = Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List users with pagination.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (1-indexed).
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of records per page.
 *     responses:
 *       '200':
 *         description: Paginated list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         items:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/AuthUserProfile'
 *                         page:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         total:
 *                           type: integer
 */
router.get(
  '/users',
  authenticate,
  authorize({ resource: 'user', action: 'manage' }),
  listUsers
);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve details for a single user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User details returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/AuthUserProfile'
 */
router.get(
  '/users/:id',
  authenticate,
  authorize({ resource: 'user', action: 'manage' }),
  getUser
);

/**
 * @openapi
 * /api/users/{id}:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update a user's profile or status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               guardianEmail:
 *                 type: string
 *                 format: email
 *               guardianName:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum:
 *                   - ACTIVE
 *                   - INACTIVE
 *                   - LOCKED
 *                   - INVITED
 *     responses:
 *       '200':
 *         description: Updated user record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/AuthUserProfile'
 */
router.patch(
  '/users/:id',
  authenticate,
  authorize({ resource: 'user', action: 'manage' }),
  updateUser
);

/**
 * @openapi
 * /api/users/{id}/roles:
 *   post:
 *     tags:
 *       - Users
 *     summary: Replace the set of roles assigned to a user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roles
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       '200':
 *         description: Updated user with new role assignments.
 */
router.post(
  '/users/:id/roles',
  authenticate,
  authorize({ resource: 'role', action: 'manage' }),
  setUserRoles
);

/**
 * @openapi
 * /api/users/{id}/roles/{roleName}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Remove a single role from the user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: roleName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Updated user after the role removal.
 */
router.delete(
  '/users/:id/roles/:roleName',
  authenticate,
  authorize({ resource: 'role', action: 'manage' }),
  removeUserRoleBinding
);

/**
 * @openapi
 * /api/roles:
 *   get:
 *     tags:
 *       - Users
 *     summary: List role capability bundles available in the system.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Role catalog returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name: { type: 'string' }
 *                           label: { type: 'string' }
 *                           description: { type: 'string' }
 *                           permissions:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name: { type: 'string' }
 *                                 resource: { type: 'string' }
 *                                 action: { type: 'string' }
 */
router.get(
  '/roles',
  authenticate,
  authorize({ resource: 'role', action: 'manage' }),
  listRoleCatalog
);

export default router;
