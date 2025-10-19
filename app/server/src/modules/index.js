import { Router } from 'express';
import healthRoutes from './health/health.routes.js';
import authRoutes from './auth/auth.routes.js';
import adminRoutes from './admin/admin.routes.js';
import emailRoutes from './email/email.routes.js';
import uploadRoutes from './uploads/uploads.routes.js';

function registerModules(app, apiPrefix) {
  const router = Router();

  router.use('/', healthRoutes);
  router.use('/', authRoutes);
  router.use('/', adminRoutes);
  router.use('/', emailRoutes);
  router.use('/', uploadRoutes);

  app.use(apiPrefix, router);
}

export default registerModules;
