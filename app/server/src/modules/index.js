import { Router } from 'express';
import healthRoutes from './health/health.routes.js';
import authRoutes from './auth/auth.routes.js';

function registerModules(app, apiPrefix) {
  const router = Router();

  router.use('/', healthRoutes);
  router.use('/', authRoutes);

  app.use(apiPrefix, router);
}

export default registerModules;
