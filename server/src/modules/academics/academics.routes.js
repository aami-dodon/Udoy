import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import {
  listTopicsHandler,
  createTopicHandler,
  createChapterHandler,
  createSubjectHandler,
  createCourseHandler,
  listCoursesHandler,
  assignCourseHandler,
  enrollStudentHandler,
} from './academics.controller.js';

export const academicRouter = Router();

academicRouter.get('/topics', requireAuth, listTopicsHandler);

academicRouter.post(
  '/topics',
  requireAuth,
  requireRoles('teacher', 'admin'),
  [body('title').isString(), body('description').optional().isString()],
  createTopicHandler
);

academicRouter.post(
  '/chapters',
  requireAuth,
  requireRoles('teacher', 'admin'),
  [body('title').isString(), body('topicId').isUUID()],
  createChapterHandler
);

academicRouter.post(
  '/subjects',
  requireAuth,
  requireRoles('teacher', 'admin'),
  [body('title').isString(), body('chapterId').isUUID()],
  createSubjectHandler
);

academicRouter.post(
  '/courses',
  requireAuth,
  requireRoles('teacher', 'admin'),
  [
    body('title').isString(),
    body('description').isString(),
    body('classLevel').isInt({ min: 4, max: 8 }),
    body('subjectId').isUUID(),
  ],
  createCourseHandler
);

academicRouter.get('/courses', requireAuth, listCoursesHandler);

academicRouter.post(
  '/courses/assign',
  requireAuth,
  requireRoles('teacher', 'admin'),
  [body('courseId').isUUID(), body('studentId').isUUID()],
  assignCourseHandler
);

academicRouter.post(
  '/courses/enroll',
  requireAuth,
  requireRoles('student'),
  [body('courseId').isUUID()],
  enrollStudentHandler
);
