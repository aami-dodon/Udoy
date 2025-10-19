import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import {
  loginPlaceholder,
  refreshPlaceholder,
} from './auth.controller.js';

const router = Router();

router.post('/auth/login', loginPlaceholder);
router.post('/auth/refresh', authenticate, refreshPlaceholder);

export default router;
