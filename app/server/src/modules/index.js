import { Router } from 'express';
import healthRoutes from './health/health.routes.js';

function registerModules(app, apiPrefix) {
  const router = Router();

  router.use('/', healthRoutes);

  app.use(apiPrefix, router);
}

export default registerModules;
