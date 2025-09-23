import { Router } from 'express';
import { param } from 'express-validator';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorizeRoles } from '../../middlewares/rbac.js';
import { getCourses, getCourse, postEnrollment } from './controller.js';

const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post(
  '/:id/enroll',
  authenticate,
  authorizeRoles(['student']),
  [param('id').isString().notEmpty()],
  postEnrollment
);

export default router;
