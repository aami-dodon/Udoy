import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';

import { env } from './env.js';
import { logInfo, logError } from '../utils/logger.js';

const ensureValue = (value, name) => {
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
};

let prismaClient;
let mongoConnection;

const createPrismaClient = () => {
  if (prismaClient) {
    return prismaClient;
  }

  const url = ensureValue(env.postgresUrl, 'POSTGRES_URL');
  prismaClient = new PrismaClient({
    datasources: {
      db: {
        url
      }
    }
  });

  return prismaClient;
};

export const connectPostgres = async () => {
  const client = createPrismaClient();

  try {
    await client.$connect();
    await client.$queryRaw`SELECT 1`;
    logInfo('Connected to Postgres via Prisma.');
    return client;
  } catch (error) {
    const errorMeta = {
      error: {
        message: error.message
      }
    };

    if (env.nodeEnv !== 'production' && error.stack) {
      errorMeta.error.stack = error.stack;
    }

    logError('Failed to connect to Postgres via Prisma', errorMeta);
    await client.$disconnect().catch(() => {});
    prismaClient = undefined;
    throw error;
  }
};

export const getPrismaClient = () => {
  if (!prismaClient) {
    return createPrismaClient();
  }
  return prismaClient;
};

export const connectMongo = async () => {
  if (mongoConnection) {
    return mongoConnection;
  }

  const uri = ensureValue(env.mongoUri, 'MONGO_URI');

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    await mongoose.connection.db.admin().ping();
    logInfo('Connected to MongoDB successfully.');
    mongoConnection = mongoose.connection;
    return mongoConnection;
  } catch (error) {
    const errorMeta = {
      error: {
        message: error.message
      }
    };

    if (env.nodeEnv !== 'production' && error.stack) {
      errorMeta.error.stack = error.stack;
    }

    logError('Failed to connect to MongoDB', errorMeta);
    await mongoose.connection.close().catch(() => {});
    throw error;
  }
};

export const closeConnections = async () => {
  if (prismaClient) {
    await prismaClient.$disconnect().catch(() => {});
    prismaClient = undefined;
  }

  if (mongoConnection) {
    await mongoose.connection.close().catch(() => {});
    mongoConnection = undefined;
  }
};
