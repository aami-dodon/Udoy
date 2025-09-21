import { Client } from 'pg';
import mongoose from 'mongoose';

import { env } from './env.js';
import { log, logError } from '../utils/logger.js';

const ensureValue = (value, name) => {
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
};

let postgresClient;
let mongoConnection;

export const connectPostgres = async () => {
  if (postgresClient) {
    return postgresClient;
  }

  const url = ensureValue(env.postgresUrl, 'POSTGRES_URL');
  const client = new Client({ connectionString: url });

  try {
    await client.connect();
    await client.query('SELECT 1');
    log('Connected to Postgres successfully.');
    postgresClient = client;
    return postgresClient;
  } catch (error) {
    logError('Failed to connect to Postgres');
    await client.end().catch(() => {});
    throw error;
  }
};

export const connectMongo = async () => {
  if (mongoConnection) {
    return mongoConnection;
  }

  const uri = ensureValue(env.mongoUri, 'MONGO_URI');

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    await mongoose.connection.db.admin().ping();
    log('Connected to MongoDB successfully.');
    mongoConnection = mongoose.connection;
    return mongoConnection;
  } catch (error) {
    logError('Failed to connect to MongoDB');
    await mongoose.connection.close().catch(() => {});
    throw error;
  }
};

export const closeConnections = async () => {
  if (postgresClient) {
    await postgresClient.end().catch(() => {});
    postgresClient = undefined;
  }

  if (mongoConnection) {
    await mongoose.connection.close().catch(() => {});
    mongoConnection = undefined;
  }
};
