import { Router } from 'express';
import { listHighlights } from './controller.js';

const router = Router();

router.get('/highlights', listHighlights);

export default router;
