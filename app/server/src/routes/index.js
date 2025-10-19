import { Router } from 'express';
import healthRouter from './health.js';

function registerRoutes(app, apiPrefix) {
  const router = Router();

  router.use('/', healthRouter);

  app.use(apiPrefix, router);
}

export default registerRoutes;
