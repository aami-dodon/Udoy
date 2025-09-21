import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.js';
import { updateProfileController } from './user.controller.js';

const router = Router();

router.put('/me', authenticate, updateProfileController);

export const userRoutes = router;
