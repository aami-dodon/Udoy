import { Router } from 'express';

import { authorizeRoles, authenticate } from '../../middlewares/auth.js';
import { ROLES } from '../../../../shared/constants/index.js';
import {
  deleteUserController,
  listUsersController,
  updateUserController
} from './users.controller.js';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router.get('/', listUsersController);
router.put('/:id', updateUserController);
router.delete('/:id', deleteUserController);

export const adminUserRoutes = router;
