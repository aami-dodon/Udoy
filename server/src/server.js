import { createApp } from './app/index.js';
import { env } from './config/env.js';
import { connectMongo, prisma } from './config/database.js';
import { logger } from './config/logger.js';

const bootstrap = async () => {
  try {
    await prisma.$connect();
    await connectMongo();
    const app = createApp();
    app.listen(env.port, () => {
      logger.info({ msg: `Server running on port ${env.port}` });
    });
  } catch (error) {
    logger.error({ msg: 'Failed to start server', error: error.message });
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

export default bootstrap;
