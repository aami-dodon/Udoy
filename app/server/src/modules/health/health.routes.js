import { Router } from 'express';
import { getHealthStatus } from './health.controller.js';

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Retrieve the health status of the Udoy platform.
 *     description: |
 *       Performs a series of checks against critical dependencies such as Postgres, MinIO,
 *       and the CORS configuration. A 503 status is returned when any dependency is unavailable.
 *     responses:
 *       '200':
 *         description: Service is healthy and ready to accept traffic.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *                 - timestamp
 *                 - uptime
 *                 - checks
 *                 - cors
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ok]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   format: float
 *                   description: Uptime in seconds.
 *                 checks:
 *                   type: object
 *                   additionalProperties: true
 *                   description: Map of dependency health checks and their status payloads.
 *                 cors:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     allowedOrigins:
 *                       type: array
 *                       items:
 *                         type: string
 *                     allowCredentials:
 *                       type: boolean
 *       '503':
 *         description: At least one dependency is unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *                 - timestamp
 *                 - checks
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [error]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 checks:
 *                   type: object
 *                   additionalProperties: true
 */
router.get('/health', getHealthStatus);

export default router;
