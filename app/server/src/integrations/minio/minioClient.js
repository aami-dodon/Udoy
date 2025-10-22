import { Client } from 'minio';
import env from '../../config/env.js';
import AppError from '../../utils/appError.js';
import logger from '../../utils/logger.js';

export class MinioConfigError extends AppError {
  constructor(message, options = {}) {
    super(message || 'MinIO configuration is unavailable.', {
      status: 503,
      code: 'MINIO_CONFIGURATION_ERROR',
      ...options,
    });
    this.name = 'MinioConfigError';
  }
}

const minioConfig = env.minio || null;
const bucketName = minioConfig?.bucket || null;
const forceSignedDownloads = Boolean(minioConfig?.forceSignedDownloads);

let minioClient = null;

if (!minioConfig) {
  logger.warn('MinIO configuration not provided; storage features are disabled.');
} else {
  const { endpoint, port, useSSL, accessKey, secretKey, region } = minioConfig;

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

  if (!bucketName) {
    logger.warn('MinIO bucket name is missing; presigned URL generation will be unavailable.');
  }
}

export function getMinioClient() {
  return minioClient;
}

export function getMinioBucket() {
  return bucketName;
}

export function isMinioConfigured() {
  return Boolean(minioConfig && minioClient && bucketName);
}

export const DEFAULT_EXPIRY_SECONDS = 15 * 60;
export const MAX_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

function ensureMinioReady() {
  if (!minioConfig) {
    throw new MinioConfigError('MinIO configuration is not available.');
  }

  if (!bucketName) {
    throw new MinioConfigError('MinIO bucket is not configured.');
  }

  if (!minioClient) {
    throw new MinioConfigError('MinIO client failed to initialize.');
  }
}

function normalizeObjectKey(objectKey) {
  if (!objectKey || typeof objectKey !== 'string') {
    return null;
  }

  return objectKey.trim().replace(/^\/+/, '');
}

function resolveExpirySeconds(expirySeconds) {
  if (!expirySeconds) {
    return DEFAULT_EXPIRY_SECONDS;
  }

  const str = String(expirySeconds).trim().toLowerCase();
  const match = str.match(/^(\d+)([dhms])?$/);

  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2] || 's';

    let seconds;
    switch (unit) {
      case 'd':
        seconds = value * 24 * 60 * 60;
        break;
      case 'h':
        seconds = value * 60 * 60;
        break;
      case 'm':
        seconds = value * 60;
        break;
      case 's':
      default:
        seconds = value;
        break;
    }

    const clamped = Math.min(Math.max(seconds, 1), MAX_EXPIRY_SECONDS);
    return clamped;
  }

  const numeric = Number(str);
  if (Number.isFinite(numeric) && numeric > 0) {
    const clamped = Math.min(Math.max(Math.floor(numeric), 1), MAX_EXPIRY_SECONDS);
    return clamped;
  }

  return DEFAULT_EXPIRY_SECONDS;
}

export function getMinioPublicUrl(objectKey) {
  if (forceSignedDownloads) {
    return null;
  }

  const baseUrl = minioConfig?.publicBaseUrl;
  const normalizedKey = normalizeObjectKey(objectKey);

  if (!baseUrl || !normalizedKey) {
    return null;
  }

  try {
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const url = new URL(normalizedKey, normalizedBase);
    return url.toString();
  } catch (error) {
    logger.warn('Failed to construct MinIO public URL', {
      error: error.message,
      baseUrl,
      objectKey: normalizedKey,
    });
    return null;
  }
}

export async function getPresignedPutUrl(objectKey, { expirySeconds, contentType } = {}) {
  ensureMinioReady();
  const normalizedKey = normalizeObjectKey(objectKey);

  if (!normalizedKey) {
    throw new Error('A valid object key is required to generate a presigned PUT URL.');
  }

  const expiry = resolveExpirySeconds(expirySeconds);
  const requestParams = contentType ? { 'Content-Type': contentType } : undefined;

  try {
    const args = [bucketName, normalizedKey, expiry];

    if (requestParams) {
      args.push(requestParams);
    }

    const url = await minioClient.presignedPutObject(...args);

    return {
      url,
      method: 'PUT',
      expirySeconds: expiry,
      headers: requestParams ? { 'Content-Type': contentType } : undefined,
      bucket: bucketName,
      objectKey: normalizedKey,
    };
  } catch (error) {
    logger.error('Failed to generate MinIO presigned PUT URL', {
      error: error.message,
      bucket: bucketName,
      objectKey: normalizedKey,
    });
    throw error;
  }
}

export async function getPresignedGetUrl(objectKey, { expirySeconds, responseHeaders } = {}) {
  ensureMinioReady();
  const normalizedKey = normalizeObjectKey(objectKey);

  if (!normalizedKey) {
    throw new Error('A valid object key is required to generate a presigned GET URL.');
  }

  const expiry = resolveExpirySeconds(expirySeconds);
  const safeHeaders =
    responseHeaders && typeof responseHeaders === 'object' && !Array.isArray(responseHeaders)
      ? responseHeaders
      : undefined;

  try {
    const args = [bucketName, normalizedKey, expiry];

    if (safeHeaders) {
      args.push(safeHeaders);
    }

    const url = await minioClient.presignedGetObject(...args);

    return {
      url,
      method: 'GET',
      expirySeconds: expiry,
      headers: safeHeaders,
      bucket: bucketName,
      objectKey: normalizedKey,
    };
  } catch (error) {
    logger.error('Failed to generate MinIO presigned GET URL', {
      error: error.message,
      bucket: bucketName,
      objectKey: normalizedKey,
    });
    throw error;
  }
}

export default minioClient;
