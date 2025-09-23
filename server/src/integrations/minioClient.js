import Minio from 'minio';
import { env } from '../config/env.js';

export const minioClient = new Minio.Client({
  endPoint: env.minio.endPoint,
  port: env.minio.port,
  useSSL: env.minio.useSSL,
  accessKey: env.minio.accessKey,
  secretKey: env.minio.secretKey
});

/**
 * Create a presigned upload URL for secure file uploads.
 * @param {string} objectName Unique identifier for object in MinIO.
 * @param {number} expiry Expiration in seconds.
 * @returns {Promise<string>} Presigned URL string.
 */
export async function createPresignedUploadUrl(objectName, expiry = 3600) {
  return minioClient.presignedPutObject(env.minio.bucket, objectName, expiry);
}
