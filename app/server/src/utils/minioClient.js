import { Client } from 'minio';
import env from '../config/env.js';
import logger from './logger.js';

let minioClient = null;

if (env.minio) {
  const { endpoint, port, useSSL, accessKey, secretKey, region } = env.minio;

  const clientConfig = {
    endPoint: endpoint,
    useSSL,
    accessKey,
    secretKey,
  };

  if (typeof port === 'number' && !Number.isNaN(port)) {
    clientConfig.port = port;
  }

  if (region) {
    clientConfig.region = region;
  }

  try {
    minioClient = new Client(clientConfig);
  } catch (error) {
    logger.error('Failed to initialize MinIO client', { error: error.message });
  }
}

export default minioClient;
