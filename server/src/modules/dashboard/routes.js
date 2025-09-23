import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorizeRoles } from '../../middlewares/rbac.js';
import { studentDashboard, teacherDashboard, adminDashboard } from './controller.js';

const router = Router();

router.get('/student', authenticate, authorizeRoles(['student']), studentDashboard);
router.get('/teacher', authenticate, authorizeRoles(['teacher']), teacherDashboard);
router.get('/admin', authenticate, authorizeRoles(['admin']), adminDashboard);

export default router;
