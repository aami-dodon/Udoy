import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
  MAX_PRESIGNED_EXPIRY_SECONDS
} from '../src/modules/storage/storage.service.js';
import { env } from '../src/config/env.js';
import { ApplicationError } from '../src/utils/errors.js';

test('getPresignedUploadUrl returns signed data with defaults', async () => {
  const originalBucket = env.minio.bucket;
  const originalExpiry = env.minio.presignedUrlExpirySeconds;

  env.minio.bucket = 'test-bucket';
  env.minio.presignedUrlExpirySeconds = 120;

  const calls = [];
  const fakeClient = {
    presignedPutObject: async (bucket, key, expiry, headers) => {
      calls.push({ bucket, key, expiry, headers });
      return `https://example.com/${bucket}/${key}`;
    }
  };

  try {
    const result = await getPresignedUploadUrl(
      {
        objectKey: 'users/123/profile.jpg',
        contentType: 'image/jpeg'
      },
      fakeClient
    );

    assert.equal(result.method, 'PUT');
    assert.match(result.url, /example.com/);
    assert.deepEqual(result.headers, { 'Content-Type': 'image/jpeg' });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].bucket, 'test-bucket');
    assert.equal(calls[0].key, 'users/123/profile.jpg');
    assert.equal(calls[0].expiry, 120);
    assert.deepEqual(calls[0].headers, { 'Content-Type': 'image/jpeg' });
  } finally {
    env.minio.bucket = originalBucket;
    env.minio.presignedUrlExpirySeconds = originalExpiry;
  }
});

test('getPresignedDownloadUrl clamps expiry to maximum supported window', async () => {
  const originalBucket = env.minio.bucket;
  env.minio.bucket = 'test-bucket';

  const calls = [];
  const fakeClient = {
    presignedGetObject: async (bucket, key, expiry) => {
      calls.push({ bucket, key, expiry });
      return `https://downloads.example.com/${key}`;
    }
  };

  try {
    const requestedExpiry = MAX_PRESIGNED_EXPIRY_SECONDS * 2;
    const result = await getPresignedDownloadUrl(
      {
        objectKey: 'users/123/profile.jpg',
        expiresIn: requestedExpiry
      },
      fakeClient
    );

    assert.equal(result.method, 'GET');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].bucket, 'test-bucket');
    assert.equal(calls[0].key, 'users/123/profile.jpg');
    assert.equal(calls[0].expiry, MAX_PRESIGNED_EXPIRY_SECONDS);
  } finally {
    env.minio.bucket = originalBucket;
  }
});

test('getPresignedUploadUrl rejects unsafe object keys', async () => {
  const fakeClient = {
    presignedPutObject: async () => {
      throw new Error('should not be called');
    }
  };

  await assert.rejects(
    () =>
      getPresignedUploadUrl(
        {
          objectKey: '../etc/passwd'
        },
        fakeClient
      ),
    (error) => error instanceof ApplicationError && /invalid path/i.test(error.message)
  );
});
