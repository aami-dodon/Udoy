import env from './config/env.js';
import createApp from './app.js';
import logger from './utils/logger.js';
import prisma from './utils/prismaClient.js';
import { ensureCoreRbac } from './services/rbacService.js';
import { ensureDefaultAdmin } from './services/bootstrapService.js';

try {
  await ensureCoreRbac();
  logger.info('RBAC capabilities synchronized');
} catch (error) {
  logger.error('Failed to initialize RBAC during startup', { error: error.message });
}

try {
  await ensureDefaultAdmin();
} catch (error) {
  logger.error('Failed to ensure default admin during startup', { error: error.message });
  throw error;
}

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`Server listening on port ${env.port}`);
});

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully.`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch (error) {
      logger.error('Error during Prisma disconnect', { message: error.message });
    } finally {
      process.exit(0);
    }
  });
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal));
});

process.on('beforeExit', async () => {
  try {
    await prisma.$disconnect();
  } catch (error) {
    logger.error('Error during Prisma disconnect', { message: error.message });
  }
});
