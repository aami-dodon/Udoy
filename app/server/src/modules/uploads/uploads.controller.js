import {
  MinioConfigError,
  getPresignedPutUrl,
  getPresignedGetUrl,
  getMinioPublicUrl,
} from '../../integrations/minio/index.js';

function sanitizeObjectKey(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value
    .trim()
    .replace(/^\/+/u, '')
    .replace(/\/+/g, '/')
    .replace(/\/+$/u, '');

  if (!trimmed || trimmed.includes('..')) {
    return null;
  }

  return trimmed;
}

function normalizeOperation(operation) {
  const normalized =
    typeof operation === 'string' && operation.trim()
      ? operation.trim().toLowerCase()
      : 'put';

  return normalized === 'get' ? 'get' : 'put';
}

function resolveExpiry(expiresIn) {
  const parsed = Number(expiresIn);

  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }

  return undefined;
}

export async function createPresignedUrl(req, res, next) {
  try {
    const { objectKey, operation, expiresIn, contentType, responseHeaders } = req.body || {};
    const sanitizedKey = sanitizeObjectKey(objectKey);

    if (!sanitizedKey) {
      return res.status(400).json({
        status: 'error',
        message: 'A valid objectKey is required for presigned URL requests.',
      });
    }

    const normalizedOperation = normalizeOperation(operation);
    const expirySeconds = resolveExpiry(expiresIn);

    let presignResult;

    if (normalizedOperation === 'get') {
      presignResult = await getPresignedGetUrl(sanitizedKey, {
        expirySeconds,
        responseHeaders,
      });
    } else {
      const safeContentType =
        typeof contentType === 'string' && contentType.trim() ? contentType.trim() : undefined;

      presignResult = await getPresignedPutUrl(sanitizedKey, {
        expirySeconds,
        contentType: safeContentType,
      });
    }

    const expiresAt = new Date(Date.now() + presignResult.expirySeconds * 1000).toISOString();
    const publicUrl = getMinioPublicUrl(sanitizedKey);

    return res.status(200).json({
      status: 'success',
      data: {
        url: presignResult.url,
        method: presignResult.method,
        objectKey: presignResult.objectKey,
        bucket: presignResult.bucket,
        headers: presignResult.headers,
        expiresIn: presignResult.expirySeconds,
        expiresAt,
        publicUrl: publicUrl || undefined,
      },
    });
  } catch (error) {
    if (error instanceof MinioConfigError) {
      return res.status(503).json({
        status: 'error',
        message: error.message,
      });
    }

    return next(error);
  }
}
