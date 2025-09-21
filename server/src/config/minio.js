import * as Minio from 'minio';

import { env } from './env.js';
import { log, logError } from '../utils/logger.js';

const ensureValue = (value, name) => {
  if (!value && value !== 0) {
    throw new Error(`${name} is not configured`);
  }
  return value;
};

let minioClient;

const verifyBucketExists = (client, bucket) =>
  new Promise((resolve, reject) => {
    client.bucketExists(bucket, (error, exists) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(exists);
    });
  });

export const createMinioClient = async () => {
  if (minioClient) {
    return minioClient;
  }

  const endpoint = ensureValue(env.minio.endpoint, 'MINIO_ENDPOINT');
  const port = ensureValue(env.minio.port, 'MINIO_PORT');
  const accessKey = ensureValue(env.minio.accessKey, 'MINIO_ACCESS_KEY');
  const secretKey = ensureValue(env.minio.secretKey, 'MINIO_SECRET_KEY');
  const bucket = ensureValue(env.minio.bucket, 'MINIO_BUCKET');

  const client = new Minio.Client({
    endPoint: endpoint,
    port,
    useSSL: env.minio.useSSL,
    accessKey,
    secretKey
  });

  try {
    const exists = await verifyBucketExists(client, bucket);
    if (!exists) {
      throw new Error(`MinIO bucket ${bucket} not found`);
    }
    log(`MinIO bucket '${bucket}' verified at ${endpoint}:${port}`);
    minioClient = client;
    return minioClient;
  } catch (error) {
    logError('Failed to validate MinIO connection or bucket', error);
    throw error;
  }
};
