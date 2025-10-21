import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import {
  getMyProfile,
  updateMyProfile,
  getProfileById,
  updateProfileById,
} from './profile.controller.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ProfileResource:
 *       type: object
 *       properties:
 *         avatarUrl:
 *           type: string
 *           format: uri
 *         bio:
 *           type: string
 *         location:
 *           type: string
 *         timezone:
 *           type: string
 *         className:
 *           type: string
 *         learningPreferences:
 *           type: object
 *           properties:
 *             languages:
 *               type: array
 *               items:
 *                 type: string
 *             topics:
 *               type: array
 *               items:
 *                 type: string
 *             pace:
 *               type: string
 *         linkedCoachId:
 *           type: string
 *         subjectExpertise:
 *           type: array
 *           items:
 *             type: string
 *         profession:
 *           type: string
 *         education:
 *           type: string
 *         teacherSpecialties:
 *           type: array
 *           items:
 *             type: string
 *         coachingSchedule:
 *           type: string
 *         coachingStrengths:
 *           type: array
 *           items:
 *             type: string
 *         assignedStudents:
 *           type: array
 *           items:
 *             type: string
 *         organizationName:
 *           type: string
 *         sector:
 *           type: string
 *         primaryContact:
 *           type: string
 *         pledgedCredits:
 *           type: integer
 *           format: int32
 *           minimum: 0
 *         notificationSettings:
 *           type: object
 *           properties:
 *             email:
 *               type: boolean
 *             sms:
 *               type: boolean
 *             push:
 *               type: boolean
 *             digest:
 *               type: string
 *               enum: [realtime, daily, weekly, monthly]
 *         accessibilitySettings:
 *           type: object
 *           properties:
 *             highContrast:
 *               type: boolean
 *             textScale:
 *               type: string
 *               enum: [normal, large, x-large]
 *             captions:
 *               type: boolean
 *             screenReaderHints:
 *               type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

router.use(authenticate);

/**
 * @openapi
 * /api/profile/me:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Retrieve the authenticated user's profile.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Profile details for the authenticated user.
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
 *                         user:
 *                           $ref: '#/components/schemas/AuthUserProfile'
 *                         profile:
 *                           $ref: '#/components/schemas/ProfileResource'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/profile/me', authorize({ resource: 'user-profile', action: 'self-manage' }), getMyProfile);

/**
 * @openapi
 * /api/profile/me:
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Update profile settings for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatarUrl:
 *                 type: string
 *               bio:
 *                 type: string
 *               location:
 *                 type: string
 *               timezone:
 *                 type: string
 *               className:
 *                 type: string
 *               learningPreferences:
 *                 type: object
 *               linkedCoachId:
 *                 type: string
 *               subjectExpertise:
 *                 type: array
 *                 items:
 *                   type: string
 *               profession:
 *                 type: string
 *               education:
 *                 type: string
 *               teacherSpecialties:
 *                 type: array
 *                 items:
 *                   type: string
 *               coachingSchedule:
 *                 type: string
 *               coachingStrengths:
 *                 type: array
 *                 items:
 *                   type: string
 *               assignedStudents:
 *                 type: array
 *                 items:
 *                   type: string
 *               organizationName:
 *                 type: string
 *               sector:
 *                 type: string
 *               primaryContact:
 *                 type: string
 *               pledgedCredits:
 *                 type: integer
 *               notificationSettings:
 *                 type: object
 *               accessibilitySettings:
 *                 type: object
 *     responses:
 *       '200':
 *         description: Updated profile for the authenticated user.
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
 *                         user:
 *                           $ref: '#/components/schemas/AuthUserProfile'
 *                         profile:
 *                           $ref: '#/components/schemas/ProfileResource'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/profile/me', authorize({ resource: 'user-profile', action: 'self-manage' }), updateMyProfile);

/**
 * @openapi
 * /api/profile/{userId}:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Retrieve profile information for a specific user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Profile details for the requested user.
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
 *                         user:
 *                           $ref: '#/components/schemas/AuthUserProfile'
 *                         profile:
 *                           $ref: '#/components/schemas/ProfileResource'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/profile/:userId', authorize({ resource: 'user-profile', action: 'manage' }), getProfileById);

/**
 * @openapi
 * /api/profile/{userId}:
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Update profile settings for a specific user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileResource'
 *     responses:
 *       '200':
 *         description: Updated profile for the specified user.
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
 *                         user:
 *                           $ref: '#/components/schemas/AuthUserProfile'
 *                         profile:
 *                           $ref: '#/components/schemas/ProfileResource'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/profile/:userId', authorize({ resource: 'user-profile', action: 'manage' }), updateProfileById);

export default router;
