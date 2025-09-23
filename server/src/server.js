import app from './app.js';
import { env } from './config/env.js';
import { connectDatabases } from './config/database.js';
import { logger } from './config/logger.js';

async function start() {
  await connectDatabases();
  app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port}`);
  });
}

start();
