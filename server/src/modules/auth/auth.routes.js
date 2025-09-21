import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.js';
import { loginController, meController, signupController } from './auth.controller.js';

const router = Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/me', authenticate, meController);

export const authRoutes = router;
