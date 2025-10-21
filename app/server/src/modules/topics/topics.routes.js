import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import {
  listTopics,
  createTopic,
  getTopic,
  updateTopic,
  submitTopicForReview,
  recordReviewDecision,
  publishTopic,
  createTopicRevision,
  getTopicHistory,
} from './topics.controller.js';

function resolveActionWithAdminOverride(fallbackAction) {
  return (req) => (req.user?.roles?.includes('admin') ? 'manage' : fallbackAction);
}

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     TopicTag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         description:
 *           type: string
 *         metadata:
 *           type: object
 *         assignedAt:
 *           type: string
 *           format: date-time
 *         assignedById:
 *           type: string
 *     TopicAlignment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         framework:
 *           type: string
 *         subject:
 *           type: string
 *         standardCode:
 *           type: string
 *         gradeLevel:
 *           type: string
 *         description:
 *           type: string
 *         metadata:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TopicWorkflowEvent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         topicId:
 *           type: string
 *         actorId:
 *           type: string
 *         fromStatus:
 *           type: string
 *           enum: [DRAFT, IN_REVIEW, CHANGES_REQUESTED, APPROVED, PUBLISHED, ARCHIVED]
 *         toStatus:
 *           type: string
 *         decision:
 *           type: string
 *           enum: [APPROVED, CHANGES_REQUESTED, COMMENT]
 *         comment:
 *           type: string
 *         metadata:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *     TopicReview:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         topicId:
 *           type: string
 *         actorId:
 *           type: string
 *         decision:
 *           type: string
 *           enum: [APPROVED, CHANGES_REQUESTED, COMMENT]
 *         comment:
 *           type: string
 *         metadata:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *     TopicGroup:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         slug:
 *           type: string
 *         defaultLanguage:
 *           type: string
 *         summary:
 *           type: string
 *         metadata:
 *           type: object
 *         archivedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TopicTag'
 *         alignments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TopicAlignment'
 *     Topic:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         groupId:
 *           type: string
 *         language:
 *           type: string
 *         title:
 *           type: string
 *         summary:
 *           type: string
 *         content:
 *           type: object
 *         status:
 *           type: string
 *           enum: [DRAFT, IN_REVIEW, CHANGES_REQUESTED, APPROVED, PUBLISHED, ARCHIVED]
 *         version:
 *           type: integer
 *         isLatest:
 *           type: boolean
 *         metadata:
 *           type: object
 *         accessibility:
 *           type: object
 *         notes:
 *           type: string
 *         createdById:
 *           type: string
 *         updatedById:
 *           type: string
 *         submittedById:
 *           type: string
 *         reviewedById:
 *           type: string
 *         publishedById:
 *           type: string
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         statusChangedAt:
 *           type: string
 *           format: date-time
 *         supersedesId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         group:
 *           $ref: '#/components/schemas/TopicGroup'
 *         reviews:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TopicReview'
 *         workflow:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TopicWorkflowEvent'
 */

router.use(authenticate);

/**
 * @openapi
 * /api/topics:
 *   get:
 *     tags:
 *       - Topics
 *     summary: List topics with optional filters.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: tagIds
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Paginated list of topics.
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
 *                             $ref: '#/components/schemas/Topic'
 *                         page:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         total:
 *                           type: integer
 */
router.get(
  '/topics',
  authorize({ resource: 'topic', action: resolveActionWithAdminOverride('view') }),
  listTopics
);

/**
 * @openapi
 * /api/topics:
 *   post:
 *     tags:
 *       - Topics
 *     summary: Create a new topic draft.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *               language:
 *                 type: string
 *               title:
 *                 type: string
 *                 minLength: 1
 *               summary:
 *                 type: string
 *               content:
 *                 type: object
 *               metadata:
 *                 type: object
 *               accessibility:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: object
 *               alignments:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       '201':
 *         description: Created topic draft.
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
 *                         topic:
 *                           $ref: '#/components/schemas/Topic'
 */
router.post(
  '/topics',
  authorize({ resource: 'topic', action: resolveActionWithAdminOverride('draft') }),
  createTopic
);

/**
 * @openapi
 * /api/topics/{id}:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Retrieve a topic by identifier.
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
 *         description: Topic details.
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
 *                         topic:
 *                           $ref: '#/components/schemas/Topic'
 */
router.get(
  '/topics/:id',
  authorize({ resource: 'topic', action: resolveActionWithAdminOverride('view') }),
  getTopic
);

/**
 * @openapi
 * /api/topics/{id}:
 *   patch:
 *     tags:
 *       - Topics
 *     summary: Update a topic draft.
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
 *     responses:
 *       '200':
 *         description: Updated topic.
 */
router.patch(
  '/topics/:id',
  authorize({ resource: 'topic', action: resolveActionWithAdminOverride('draft') }),
  updateTopic
);

/**
 * @openapi
 * /api/topics/{id}/submit:
 *   post:
 *     tags:
 *       - Topics
 *     summary: Submit a draft topic for review.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Topic moved to review.
 */
router.post(
  '/topics/:id/submit',
  authorize({ resource: 'topic', action: resolveActionWithAdminOverride('submit') }),
  submitTopicForReview
);

/**
 * @openapi
 * /api/topics/{id}/review:
 *   post:
 *     tags:
 *       - Topics
 *     summary: Record a review decision on a topic in review.
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
 *               decision:
 *                 type: string
 *                 enum: [APPROVED, CHANGES_REQUESTED]
 *               comment:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       '200':
 *         description: Review decision recorded.
 */
router.post(
  '/topics/:id/review',
  authorize({ resource: 'topic', action: resolveActionWithAdminOverride('review') }),
  recordReviewDecision
);

/**
 * @openapi
 * /api/topics/{id}/publish:
 *   post:
 *     tags:
 *       - Topics
 *     summary: Publish an approved topic.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Topic published.
 */
router.post(
  '/topics/:id/publish',
  authorize({ resource: 'topic', action: resolveActionWithAdminOverride('publish') }),
  publishTopic
);

/**
 * @openapi
 * /api/topics/{id}/revise:
 *   post:
 *     tags:
 *       - Topics
 *     summary: Create a new draft revision from a published topic.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Draft revision created.
 */
router.post(
  '/topics/:id/revise',
  authorize({ resource: 'topic', action: resolveActionWithAdminOverride('draft') }),
  createTopicRevision
);

/**
 * @openapi
 * /api/topics/{id}/history:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Retrieve the version history for a topic language.
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
 *         description: Topic history retrieved.
 */
router.get(
  '/topics/:id/history',
  authorize({ resource: 'topic', action: resolveActionWithAdminOverride('view') }),
  getTopicHistory
);

export default router;
