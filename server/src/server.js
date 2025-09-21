import app from './app.js';
import { env } from './config/env.js';
import { log } from './utils/logger.js';
import { connectPostgres, connectMongo, closeConnections } from './config/db.js';
import { createMinioClient } from './config/minio.js';
import { seedAdminUser } from './setup/admin.seed.js';

const start = async () => {
  if (!env.jwt.secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  await Promise.all([connectPostgres(), connectMongo()]);
  await createMinioClient();
  await seedAdminUser();

  const port = env.port;

  const server = app.listen(port, () => {
    log(`Server listening on http://localhost:${port}`);
  });

  const shutdown = async (signal) => {
    log(`Received ${signal}. Shutting down gracefully.`);
    await closeConnections();
    await new Promise((resolve) => server.close(resolve));
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start().catch((error) => {
  log('Failed to start the server');
  console.error(error);
  process.exit(1);
});
