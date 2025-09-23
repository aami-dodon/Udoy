import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import {
  listUsersHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from './users.controller.js';

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.use(requireRoles('admin'));

userRouter.get('/', listUsersHandler);
userRouter.get('/:id', getUserHandler);
userRouter.patch(
  '/:id',
  [
    body('firstName').optional().isString(),
    body('lastName').optional().isString(),
    body('role').optional().isIn(['student', 'teacher', 'admin']),
    body('classLevel').optional().isInt({ min: 4, max: 8 }),
  ],
  updateUserHandler
);
userRouter.delete('/:id', deleteUserHandler);
