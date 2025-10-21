import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import {
  handleCreateTemplate,
  handleUpdateTemplate,
  handleArchiveTemplate,
  handleGetTemplate,
  handleListTemplates,
  handleDispatchNotifications,
  handleListNotifications,
  handleGetNotification,
} from './notifications.controller.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     NotificationTemplate:
 *       $ref: '#/components/schemas/NotificationTemplate'
 *     NotificationResource:
 *       $ref: '#/components/schemas/NotificationResource'
 *     NotificationDispatchResult:
 *       $ref: '#/components/schemas/NotificationDispatchResult'
 */

router.use(authenticate);

/**
 * @openapi
 * /api/notifications/templates:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: List notification templates.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventKey
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         required: false
 *     responses:
 *       '200':
 *         description: Collection of notification templates.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NotificationTemplate'
 */
router.get(
  '/notifications/templates',
  authorize({ resource: 'notification', action: 'manage' }),
  handleListTemplates
);

/**
 * @openapi
 * /api/notifications/templates:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Create a notification template.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationTemplate'
 *     responses:
 *       '201':
 *         description: Template created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/NotificationTemplate'
 */
router.post(
  '/notifications/templates',
  authorize({ resource: 'notification', action: 'manage' }),
  handleCreateTemplate
);

/**
 * @openapi
 * /api/notifications/templates/{templateId}:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Retrieve a notification template by id.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Template details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/NotificationTemplate'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/notifications/templates/:templateId',
  authorize({ resource: 'notification', action: 'manage' }),
  handleGetTemplate
);

/**
 * @openapi
 * /api/notifications/templates/{templateId}:
 *   put:
 *     tags:
 *       - Notifications
 *     summary: Update an existing notification template.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationTemplate'
 *     responses:
 *       '200':
 *         description: Updated template payload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/NotificationTemplate'
 */
router.put(
  '/notifications/templates/:templateId',
  authorize({ resource: 'notification', action: 'manage' }),
  handleUpdateTemplate
);

/**
 * @openapi
 * /api/notifications/templates/{templateId}:
 *   delete:
 *     tags:
 *       - Notifications
 *     summary: Archive a notification template.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Archived template payload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/NotificationTemplate'
 */
router.delete(
  '/notifications/templates/:templateId',
  authorize({ resource: 'notification', action: 'manage' }),
  handleArchiveTemplate
);

/**
 * @openapi
 * /api/notifications/dispatch:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Dispatch notifications to one or more recipients.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationDispatchRequest'
 *     responses:
 *       '202':
 *         description: Dispatch request accepted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NotificationDispatchResult'
 */
router.post(
  '/notifications/dispatch',
  authorize({ resource: 'notification', action: 'dispatch' }),
  handleDispatchNotifications
);

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Search notification history.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *       - in: query
 *         name: eventKey
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Matching notification records.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NotificationResource'
 */
router.get(
  '/notifications',
  authorize({ resource: 'notification', action: 'manage' }),
  handleListNotifications
);

/**
 * @openapi
 * /api/notifications/{notificationId}:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Retrieve a single notification including delivery logs.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Notification details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/NotificationResource'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/notifications/:notificationId',
  authorize({ resource: 'notification', action: 'manage' }),
  handleGetNotification
);

export default router;
