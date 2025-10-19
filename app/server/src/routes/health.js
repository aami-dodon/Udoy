import { Router } from 'express';
import prisma from '../utils/prismaClient.js';

const router = Router();

router.get('/health', async (req, res, next) => {
  try {
    await prisma.healthCheck.count();
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

export default router;
