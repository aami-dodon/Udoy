import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(moduleDir, '../..');
const projectRoot = path.resolve(serverDir, '..');

const envFileCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(serverDir, '.env'),
  path.resolve(projectRoot, '.env')
];

const loadedEnvFiles = new Set();

for (const candidate of envFileCandidates) {
  if (!candidate || loadedEnvFiles.has(candidate)) {
    continue;
  }

  if (!fs.existsSync(candidate)) {
    continue;
  }

  dotenv.config({ path: candidate, override: false });
  loadedEnvFiles.add(candidate);
}

const get = (key, defaultValue) => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value;
};

const getStringList = (key, defaultValue = '') => {
  const raw = get(key, defaultValue);
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const env = {
  nodeEnv: get('NODE_ENV', 'development'),
  port: parseInt(get('PORT', '5000'), 10),
  postgresUrl: get('POSTGRES_URL', ''),
  mongoUri: get('MONGO_URI', ''),
  logging: {
    level: get('LOG_LEVEL')
  },
  app: {
    baseUrl: get('APP_BASE_URL', 'http://localhost:3000')
  },
  jwt: {
    secret: get('JWT_SECRET', ''),
    expiresIn: get('JWT_EXPIRES_IN', '1d')
  },
  adminSeed: {
    name: get('ADMIN_NAME', ''),
    email: get('ADMIN_EMAIL', ''),
    password: get('ADMIN_PASSWORD', ''),
    role: get('ADMIN_ROLE', 'teacher')
  },
  email: {
    host: get('SMTP_HOST', ''),
    port: parseInt(get('SMTP_PORT', '587'), 10),
    user: get('SMTP_USER', ''),
    password: get('SMTP_PASSWORD', ''),
    secure: get('SMTP_SECURE', 'false') === 'true',
    from: get('SMTP_FROM', '')
  },
  supportEmail: get('SUPPORT_EMAIL', ''),
  cors: {
    allowedOrigins: getStringList('CORS_ALLOWED_ORIGINS', 'http://localhost:3000'),
    allowCredentials: get('CORS_ALLOW_CREDENTIALS', 'false') === 'true'
  },
  rateLimit: {
    windowMs: parseInt(get('RATE_LIMIT_WINDOW_MS', `${15 * 60 * 1000}`), 10),
    maxSignup: parseInt(get('RATE_LIMIT_MAX_SIGNUP', '5'), 10),
    maxLogin: parseInt(get('RATE_LIMIT_MAX_LOGIN', '10'), 10),
    maxForgotPassword: parseInt(get('RATE_LIMIT_MAX_FORGOT_PASSWORD', '5'), 10),
    maxResetPassword: parseInt(get('RATE_LIMIT_MAX_RESET_PASSWORD', '10'), 10)
  },
  minio: {
    endpoint: get('MINIO_ENDPOINT', ''),
    port: parseInt(get('MINIO_PORT', '9000'), 10),
    accessKey: get('MINIO_ACCESS_KEY', ''),
    secretKey: get('MINIO_SECRET_KEY', ''),
    bucket: get('MINIO_BUCKET', ''),
    useSSL: get('MINIO_USE_SSL', 'true') === 'true',
    presignedUrlExpirySeconds: parseInt(get('MINIO_PRESIGNED_URL_EXPIRY_SECONDS', '900'), 10)
  }
};
