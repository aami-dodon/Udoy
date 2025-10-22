import { PrismaClient } from '@prisma/client';

const shouldLogQueries =
  process.env.NODE_ENV === 'development' && process.env.PRISMA_LOG_QUERIES === 'true';

const logLevels = shouldLogQueries ? ['query', 'error', 'warn'] : ['error'];

const prisma = new PrismaClient({
  log: logLevels,
});

export default prisma;
