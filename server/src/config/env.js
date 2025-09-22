import dotenv from 'dotenv';

dotenv.config();

const get = (key, defaultValue) => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value;
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
  minio: {
    endpoint: get('MINIO_ENDPOINT', ''),
    port: parseInt(get('MINIO_PORT', '9000'), 10),
    accessKey: get('MINIO_ACCESS_KEY', ''),
    secretKey: get('MINIO_SECRET_KEY', ''),
    bucket: get('MINIO_BUCKET', ''),
    useSSL: get('MINIO_USE_SSL', 'true') === 'true'
  }
};
