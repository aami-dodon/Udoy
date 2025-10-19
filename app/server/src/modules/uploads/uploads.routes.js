import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { createPresignedUrl } from './uploads.controller.js';

const router = Router();

/**
 * @openapi
 * /api/uploads/presign:
 *   post:
 *     tags:
 *       - Uploads
 *     summary: Generate a MinIO presigned URL for uploading or downloading an object.
 *     description: |
 *       Produces a signed URL for the requested `objectKey`. Upload requests (`operation: put`)
 *       return a PUT URL alongside any headers that must accompany the upload. Download requests
 *       (`operation: get`) return a GET URL and merge any requested response headers.
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UploadPresignRequest'
 *     responses:
 *       '200':
 *         description: Successfully generated a presigned URL.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadPresignResponse'
 *       '400':
 *         description: Invalid request payload such as a missing or unsafe `objectKey`.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Missing or invalid authentication context.
 *       '403':
 *         description: Authenticated user lacks the required storage permissions.
 *       '503':
 *         description: MinIO is not configured or temporarily unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/uploads/presign',
  authenticate,
  authorize({
    resource: 'storage:uploads',
    action: (req) => {
      const operation =
        typeof req.body?.operation === 'string' && req.body.operation.trim()
          ? req.body.operation.trim().toLowerCase()
          : 'put';

      return operation === 'get' ? 'read' : 'write';
    },
  }),
  createPresignedUrl
);

export default router;
