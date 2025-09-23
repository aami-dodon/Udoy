import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.postgresUrl
    }
  }
});

export async function connectDatabases() {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL via Prisma');
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL: %s', error.message);
  }

  try {
    await mongoose.connect(env.mongoUrl);
    logger.info('Connected to MongoDB via Mongoose');
  } catch (error) {
    logger.error('Failed to connect to MongoDB: %s', error.message);
  }
}

export async function disconnectDatabases() {
  await prisma.$disconnect();
  await mongoose.disconnect();
}
