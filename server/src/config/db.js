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
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      password_updated_at TIMESTAMPTZ,
      deleted_at TIMESTAMPTZ
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

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'is_verified'
      ) THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
        UPDATE users SET is_verified = TRUE WHERE role = 'admin';
        ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT FALSE;
        ALTER TABLE users ALTER COLUMN is_verified SET NOT NULL;
      END IF;
    END $$;
  `);

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'is_active'
      ) THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        UPDATE users SET is_active = TRUE WHERE is_active IS NULL;
        ALTER TABLE users ALTER COLUMN is_active SET DEFAULT TRUE;
        ALTER TABLE users ALTER COLUMN is_active SET NOT NULL;
      END IF;
    END $$;
  `);

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'updated_at'
      ) THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ;
        UPDATE users SET updated_at = created_at WHERE updated_at IS NULL;
        ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT NOW();
        ALTER TABLE users ALTER COLUMN updated_at SET NOT NULL;
      END IF;
    END $$;
  `);

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'password_updated_at'
      ) THEN
        ALTER TABLE users ADD COLUMN password_updated_at TIMESTAMPTZ;
      END IF;
    END $$;
  `);

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'deleted_at'
      ) THEN
        ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
      END IF;
    END $$;
  `);
};

const ensureUserTokensTable = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_tokens (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      type TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}',
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      used_at TIMESTAMPTZ
    )
  `);

  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS user_tokens_token_hash_idx
    ON user_tokens(token_hash);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS user_tokens_user_id_idx
    ON user_tokens(user_id);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS user_tokens_expires_at_idx
    ON user_tokens(expires_at);
  `);

  await client.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'user_tokens'
          AND constraint_name = 'user_tokens_type_check'
      ) THEN
        ALTER TABLE user_tokens DROP CONSTRAINT user_tokens_type_check;
      END IF;
    END $$;
  `);

  await client.query(`
    ALTER TABLE user_tokens
    ADD CONSTRAINT user_tokens_type_check CHECK (type IN ('verify_email', 'reset_password'));
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
    await ensureUserTokensTable(client);
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
