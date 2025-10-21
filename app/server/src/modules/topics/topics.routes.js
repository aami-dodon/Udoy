import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import {
  listTopics,
  getTopic,
  createTopic,
  updateTopic,
  submitTopicForReview,
  reviewTopic,
  publishTopic,
  addTopicComment,
} from './topics.controller.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Topics
 *     description: Topic Management System APIs for drafting, reviewing, and publishing educational topics.
 * components:
 *   schemas:
 *     TopicTagPayload:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         slug:
 *           type: string
 *         label:
 *           type: string
 *         description:
 *           type: string
 *         kind:
 *           type: string
 *           enum: [CLASSIFICATION, CURRICULUM, ACCESSIBILITY, SUBJECT, CUSTOM]
 *         metadata:
 *           type: object
 *         assignmentMetadata:
 *           type: object
 *     TopicDraftPayload:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 240
 *         summary:
 *           type: string
 *           maxLength: 560
 *         language:
 *           type: string
 *         contentFormat:
 *           type: string
 *           enum: [JSON, HTML]
 *         content:
 *           oneOf:
 *             - type: object
 *             - type: string
 *         accessibility:
 *           type: object
 *         metadata:
 *           type: object
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TopicTagPayload'
 *         changeNotes:
 *           type: string
 *         baseTopicId:
 *           type: string
 *     TopicCommentResource:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         topicId:
 *           type: string
 *         author:
 *           $ref: '#/components/schemas/AuthUserProfile'
 *         type:
 *           type: string
 *         body:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         resolvedBy:
 *           $ref: '#/components/schemas/AuthUserProfile'
 *     TopicRevisionResource:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         version:
 *           type: integer
 *         status:
 *           type: string
 *         title:
 *           type: string
 *         summary:
 *           type: string
 *         content:
 *           oneOf:
 *             - type: object
 *             - type: string
 *         contentFormat:
 *           type: string
 *         accessibility:
 *           type: object
 *         metadata:
 *           type: object
 *         changeNotes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           $ref: '#/components/schemas/AuthUserProfile'
 *     TopicWorkflowEventResource:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         actor:
 *           $ref: '#/components/schemas/AuthUserProfile'
 *         fromStatus:
 *           type: string
 *           nullable: true
 *         toStatus:
 *           type: string
 *         note:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     TopicResource:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         summary:
 *           type: string
 *         language:
 *           type: string
 *         status:
 *           type: string
 *         version:
 *           type: integer
 *         author:
 *           $ref: '#/components/schemas/AuthUserProfile'
 *         validator:
 *           $ref: '#/components/schemas/AuthUserProfile'
 *         tags:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               slug:
 *                 type: string
 *               label:
 *                 type: string
 *               description:
 *                 type: string
 *               kind:
 *                 type: string
 *               definitionMetadata:
 *                 type: object
 *               assignmentMetadata:
 *                 type: object
 *               assignedAt:
 *                 type: string
 *                 format: date-time
 *               assignedById:
 *                 type: string
 *         baseTopicId:
 *           type: string
 *           nullable: true
 *         submittedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         approvedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         archivedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         content:
 *           oneOf:
 *             - type: object
 *             - type: string
 *         contentFormat:
 *           type: string
 *         accessibility:
 *           type: object
 *         metadata:
 *           type: object
 *         revisions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TopicRevisionResource'
 *         workflow:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TopicWorkflowEventResource'
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TopicCommentResource'
 *     TopicSingleResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/StandardSuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 topic:
 *                   $ref: '#/components/schemas/TopicResource'
 *     TopicCollectionResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/StandardSuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TopicResource'
 *     TopicCommentResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/StandardSuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 comment:
 *                   $ref: '#/components/schemas/TopicCommentResource'
 */

router.use(authenticate);

/**
 * @openapi
 * /api/topics:
 *   get:
 *     summary: List topics with optional filtering and pagination.
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by comma-separated TopicStatus values (e.g., DRAFT,IN_REVIEW).
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by comma-separated ISO language codes (e.g., en,en-US).
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by comma-separated tag slugs.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Perform a case-insensitive search against title and summary.
 *       - in: query
 *         name: baseTopicId
 *         schema:
 *           type: string
 *         description: Return the base topic and any translations linked to the specified topic id.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: includeContent
 *         schema:
 *           type: boolean
 *         description: Include full content payload in list responses when true.
 *     responses:
 *       '200':
 *         description: Paginated list of topics.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopicCollectionResponse'
 */
router.get(
  '/topics',
  authorize({ resource: 'topic', action: 'view' }),
  listTopics,
);

/**
 * @openapi
 * /api/topics:
 *   post:
 *     summary: Create a new topic draft.
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopicDraftPayload'
 *     responses:
 *       '201':
 *         description: Topic draft created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopicSingleResponse'
 */
router.post(
  '/topics',
  authorize({ resource: 'topic', action: 'create' }),
  createTopic,
);

/**
 * @openapi
 * /api/topics/{id}:
 *   get:
 *     summary: Retrieve a topic by id.
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: full
 *         schema:
 *           type: boolean
 *         description: When false, omit revision, workflow, and comment collections.
 *     responses:
 *       '200':
 *         description: Topic details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopicSingleResponse'
 */
router.get(
  '/topics/:id',
  authorize({ resource: 'topic', action: 'view' }),
  getTopic,
);

/**
 * @openapi
 * /api/topics/{id}:
 *   patch:
 *     summary: Update an existing topic draft.
 *     tags: [Topics]
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
 *             $ref: '#/components/schemas/TopicDraftPayload'
 *     responses:
 *       '200':
 *         description: Updated topic draft.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopicSingleResponse'
 */
router.patch(
  '/topics/:id',
  authorize({ resource: 'topic', action: 'edit' }),
  updateTopic,
);

/**
 * @openapi
 * /api/topics/{id}/submit:
 *   post:
 *     summary: Submit a topic draft for review.
 *     tags: [Topics]
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
 *               note:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       '200':
 *         description: Topic moved to review state.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopicSingleResponse'
 */
router.post(
  '/topics/:id/submit',
  authorize({ resource: 'topic', action: 'submit' }),
  submitTopicForReview,
);

/**
 * @openapi
 * /api/topics/{id}/review:
 *   post:
 *     summary: Apply a review decision to a topic in review.
 *     tags: [Topics]
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
 *               - decision
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [approve, approved, changes_requested, request_changes]
 *               notes:
 *                 type: string
 *                 maxLength: 800
 *               updates:
 *                 $ref: '#/components/schemas/TopicDraftPayload'
 *               tags:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TopicTagPayload'
 *     responses:
 *       '200':
 *         description: Updated topic state.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopicSingleResponse'
 */
router.post(
  '/topics/:id/review',
  authorize({ resource: 'topic', action: 'review' }),
  reviewTopic,
);

/**
 * @openapi
 * /api/topics/{id}/publish:
 *   post:
 *     summary: Publish an approved topic.
 *     tags: [Topics]
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
 *               metadata:
 *                 type: object
 *               note:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       '200':
 *         description: Topic published.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopicSingleResponse'
 */
router.post(
  '/topics/:id/publish',
  authorize({ resource: 'topic', action: 'publish' }),
  publishTopic,
);

/**
 * @openapi
 * /api/topics/{id}/comments:
 *   post:
 *     summary: Add a workflow comment to a topic.
 *     tags: [Topics]
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
 *               - body
 *             properties:
 *               body:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [GENERAL, REVIEW, CHANGE_REQUEST]
 *               resolved:
 *                 type: boolean
 *     responses:
 *       '201':
 *         description: Comment added.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopicCommentResponse'
 */
router.post(
  '/topics/:id/comments',
  authorize({ resource: 'topic-comment', action: 'manage' }),
  addTopicComment,
);

export default router;
