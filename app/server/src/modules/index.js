import { Router } from 'express';
import healthRoutes from './health/health.routes.js';
import authRoutes from './auth/auth.routes.js';
import adminRoutes from './admin/admin.routes.js';
import emailRoutes from './email/email.routes.js';
import uploadRoutes from './uploads/uploads.routes.js';
import userRoutes from './users/users.routes.js';
import profileRoutes from './profile/profile.routes.js';

function registerModules(app, apiPrefix) {
  const router = Router();

  router.use('/', healthRoutes);
  router.use('/', authRoutes);
  router.use('/', adminRoutes);
  router.use('/', emailRoutes);
  router.use('/', uploadRoutes);
  router.use('/', userRoutes);
  router.use('/', profileRoutes);

  app.use(apiPrefix, router);
}

export default registerModules;
