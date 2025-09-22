import { ApplicationError } from '../../utils/errors.js';
import { createMinioClient } from '../../config/minio.js';
import { env } from '../../config/env.js';

export const MAX_PRESIGNED_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

const SAFE_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9/_\-.]*$/;

const sanitizeObjectKey = (objectKey) => {
  if (typeof objectKey !== 'string') {
    throw new ApplicationError('Object key must be a string', 400);
  }

  const trimmed = objectKey.trim();

  if (!trimmed) {
    throw new ApplicationError('Object key is required', 400);
  }

  if (trimmed.startsWith('/') || trimmed.includes('..')) {
    throw new ApplicationError('Object key contains invalid path segments', 400);
  }

  if (!SAFE_KEY_PATTERN.test(trimmed)) {
    throw new ApplicationError('Object key contains invalid characters', 400);
  }

  return trimmed;
};

const resolveExpirySeconds = (expiresIn) => {
  const fallback = Number.isFinite(env.minio.presignedUrlExpirySeconds)
    ? env.minio.presignedUrlExpirySeconds
    : 900;
  const raw = Number.isFinite(expiresIn) && expiresIn > 0 ? Math.floor(expiresIn) : fallback;
  return Math.min(Math.max(raw, 1), MAX_PRESIGNED_EXPIRY_SECONDS);
};

export const getPresignedUploadUrl = async (
  { objectKey, contentType, expiresIn },
  client
) => {
  const key = sanitizeObjectKey(objectKey);
  const expiry = resolveExpirySeconds(expiresIn);
  const minioClient = client || (await createMinioClient());
  const headers = contentType ? { 'Content-Type': contentType } : undefined;

  const url = await minioClient.presignedPutObject(
    env.minio.bucket,
    key,
    expiry,
    headers
  );

  return {
    url,
    method: 'PUT',
    headers: headers ?? {}
  };
};

export const getPresignedDownloadUrl = async ({ objectKey, expiresIn }, client) => {
  const key = sanitizeObjectKey(objectKey);
  const expiry = resolveExpirySeconds(expiresIn);
  const minioClient = client || (await createMinioClient());

  const url = await minioClient.presignedGetObject(env.minio.bucket, key, expiry);

  return {
    url,
    method: 'GET'
  };
};
