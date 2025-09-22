import { Router } from 'express';
import { helloController } from './hello.controller.js';

const router = Router();

/**
 * @openapi
 * /api/hello:
 *   get:
 *     summary: Health check endpoint
 *     tags:
 *       - Utility
 *     responses:
 *       200:
 *         description: Returns a friendly greeting
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/', helloController);

export const helloRoutes = router;
