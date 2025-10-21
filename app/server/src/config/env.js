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
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN = '15m',
  JWT_ACCESS_COOKIE_NAME = 'udoy_at',
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN = '7d',
  JWT_REFRESH_COOKIE_NAME = 'udoy_rt',
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_USE_SSL = 'true',
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_REGION,
  MINIO_BUCKET,
  MINIO_PUBLIC_BASE_URL,
  MINIO_FORCE_SIGNED_DOWNLOADS = 'false',
  EMAIL_FROM,
  EMAIL_VERIFICATION_URL,
  PASSWORD_RESET_URL,
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_SECURE = 'true',
  EMAIL_SMTP_USER,
  EMAIL_SMTP_PASS,
  PASSWORD_RESET_TOKEN_EXPIRES_IN = '15m',
} = process.env;

const corsAllowedOrigins = CORS_ALLOWED_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const parsedMinioPort = MINIO_PORT ? Number(MINIO_PORT) : undefined;
const hasValidMinioPort =
  parsedMinioPort !== undefined && !Number.isNaN(parsedMinioPort);

const hasMinioConfig = Boolean(
  MINIO_ENDPOINT &&
  MINIO_ACCESS_KEY &&
  MINIO_SECRET_KEY
);

const minioConfig = hasMinioConfig
  ? {
      endpoint: MINIO_ENDPOINT,
      port: hasValidMinioPort ? parsedMinioPort : undefined,
      useSSL: String(MINIO_USE_SSL).toLowerCase() === 'true',
      accessKey: MINIO_ACCESS_KEY,
      secretKey: MINIO_SECRET_KEY,
      region: MINIO_REGION || undefined,
      bucket: MINIO_BUCKET || undefined,
      publicBaseUrl: MINIO_PUBLIC_BASE_URL || undefined,
      forceSignedDownloads: String(MINIO_FORCE_SIGNED_DOWNLOADS).toLowerCase() === 'true',
    }
  : null;

const parsedSmtpPort = EMAIL_SMTP_PORT ? Number(EMAIL_SMTP_PORT) : undefined;
const hasValidSmtpPort =
  parsedSmtpPort !== undefined && !Number.isNaN(parsedSmtpPort);

const hasSmtpConfig = Boolean(
  EMAIL_SMTP_HOST &&
  EMAIL_SMTP_USER &&
  EMAIL_SMTP_PASS
);

const smtpConfig = hasSmtpConfig
  ? {
      host: EMAIL_SMTP_HOST,
      secure: String(EMAIL_SMTP_SECURE).toLowerCase() === 'true',
      auth: {
        user: EMAIL_SMTP_USER,
        pass: EMAIL_SMTP_PASS,
      },
      ...(hasValidSmtpPort ? { port: parsedSmtpPort } : {}),
    }
  : null;

const emailConfig = {
  from: EMAIL_FROM || null,
  verificationUrl: EMAIL_VERIFICATION_URL || null,
  passwordResetUrl: PASSWORD_RESET_URL || null,
  smtp: smtpConfig,
};

const authConfig = {
  passwordReset: {
    tokenExpiresIn: PASSWORD_RESET_TOKEN_EXPIRES_IN,
  },
};

const jwtConfig = {
  access: {
    secret: JWT_ACCESS_SECRET || null,
    expiresIn: JWT_ACCESS_EXPIRES_IN,
    cookieName: JWT_ACCESS_COOKIE_NAME,
  },
  refresh: {
    secret: JWT_REFRESH_SECRET || null,
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    cookieName: JWT_REFRESH_COOKIE_NAME,
  },
};

export default {
  nodeEnv: NODE_ENV,
  port: Number(SERVER_PORT) || 6005,
  apiPrefix: API_PREFIX.startsWith('/') ? API_PREFIX : `/${API_PREFIX}`,
  corsAllowedOrigins,
  defaultAdmin: {
    email: DEFAULT_ADMIN_EMAIL || null,
    password: DEFAULT_ADMIN_PASSWORD || null,
  },
  minio: minioConfig,
  email: emailConfig,
  jwt: jwtConfig,
  auth: authConfig,
};
