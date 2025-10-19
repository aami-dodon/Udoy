import dotenv from 'dotenv';

const isTest = process.env.NODE_ENV === 'test';

if (!isTest) {
  dotenv.config({ path: process.env.ENV_FILE_PATH || '.env' });
}

const {
  NODE_ENV = 'development',
  SERVER_PORT = 6005,
  API_PREFIX = '/api',
  CORS_ALLOWED_ORIGINS = 'http://localhost:6004',
} = process.env;

export default {
  nodeEnv: NODE_ENV,
  port: Number(SERVER_PORT) || 6005,
  apiPrefix: API_PREFIX.startsWith('/') ? API_PREFIX : `/${API_PREFIX}`,
  corsAllowedOrigins: CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
};
