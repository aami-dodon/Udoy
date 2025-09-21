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

const ensureUserTable = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      email_normalized TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    )
  `);

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'email_normalized'
      ) THEN
        ALTER TABLE users ADD COLUMN email_normalized TEXT;
      END IF;
    END $$;
  `);

  await client.query(`
    UPDATE users
    SET email_normalized = lower(trim(email))
    WHERE email IS NOT NULL AND (email_normalized IS NULL OR email_normalized = '');
  `);

  await client.query(`
    ALTER TABLE users
    ALTER COLUMN email_normalized SET NOT NULL;
  `);

  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_normalized_idx
    ON users(email_normalized);
  `);

  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx
    ON users(email);
  `);

  await client.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'users'
          AND constraint_name = 'users_role_check'
      ) THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
      END IF;
    END $$;
  `);

  await client.query(`
    UPDATE users
    SET role = lower(role)
    WHERE role IS NOT NULL;
  `);

  await client.query(`
    UPDATE users
    SET role = 'student'
    WHERE role IS NULL OR role NOT IN ('student', 'teacher', 'admin');
  `);

  await client.query(`
    ALTER TABLE users
    ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'teacher', 'admin'));
  `);
};

export const connectPostgres = async () => {
  if (postgresClient) {
    return postgresClient;
  }

  const url = ensureValue(env.postgresUrl, 'POSTGRES_URL');
  const client = new Client({ connectionString: url });

  try {
    await client.connect();
    await client.query('SELECT 1');
    await ensureUserTable(client);
    log('Connected to Postgres successfully.');
    postgresClient = client;
    return postgresClient;
  } catch (error) {
    logError('Failed to connect to Postgres');
    await client.end().catch(() => {});
    throw error;
  }
};

export const getPostgresClient = () => {
  if (!postgresClient) {
    throw new Error('Postgres client not initialised');
  }
  return postgresClient;
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
