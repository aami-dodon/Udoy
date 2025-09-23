import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.postgresUrl,
    },
  },
});

export const connectMongo = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(env.mongoUrl, {
    serverSelectionTimeoutMS: 5000,
  });
  logger.info({ msg: 'Mongo connected' });
};

export const disconnectDatabases = async () => {
  await prisma.$disconnect();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
