import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { getAdminOverview } from './admin.controller.js';

const router = Router();

router.get(
  '/admin/overview',
  authenticate,
  authorize({ resource: 'admin:dashboard', action: 'read' }),
  getAdminOverview
);

export default router;
