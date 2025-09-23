import dotenv from 'dotenv';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
  postgresUrl: process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5432/udoy',
  mongoUrl: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/udoy',
  minio: {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minio',
    secretKey: process.env.MINIO_SECRET_KEY || 'minio123',
    bucket: process.env.MINIO_BUCKET || 'udoy'
  }
};
