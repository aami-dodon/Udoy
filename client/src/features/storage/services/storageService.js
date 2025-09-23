import { fetchJson } from '../../../utils/api.js';

/**
 * @typedef {import('@shared/types/storage').StoragePresignRequestPayload} StoragePresignRequestPayload
 * @typedef {import('@shared/types/storage').StoragePresignDownloadRequestPayload} StoragePresignDownloadRequestPayload
 * @typedef {import('@shared/types/storage').StoragePresignedUrlResponse} StoragePresignedUrlResponse
 */

const assertToken = (token) => {
  if (!token) {
    throw new Error('Authentication token is required to interact with storage.');
  }
};

/**
 * Requests a presigned URL for uploading an object to MinIO.
 * @param {string} token
 * @param {StoragePresignRequestPayload} payload
 * @returns {Promise<StoragePresignedUrlResponse>}
 */
export const requestPresignedUploadUrl = (token, payload) => {
  assertToken(token);
  return fetchJson('/api/storage/presign-upload', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * Requests a presigned URL for downloading an object from MinIO.
 * @param {string} token
 * @param {StoragePresignDownloadRequestPayload} payload
 * @returns {Promise<StoragePresignedUrlResponse>}
 */
export const requestPresignedDownloadUrl = (token, payload) => {
  assertToken(token);
  return fetchJson('/api/storage/presign-download', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * Uploads a Blob or File to MinIO using a presigned request.
 * @param {StoragePresignedUrlResponse} presigned
 * @param {Blob | File | ArrayBufferView | ArrayBuffer | ReadableStream} body
 * @returns {Promise<Response>}
 */
export const uploadWithPresignedRequest = async (presigned, body) => {
  if (!presigned || !presigned.url) {
    throw new Error('Presigned upload information is required.');
  }

  const { url, method = 'PUT', headers = {} } = presigned;
  const response = await fetch(url, {
    method,
    headers,
    body
  });

  if (!response.ok) {
    throw new Error('Failed to upload file to storage.');
  }

  return response;
};

/**
 * Fetches the binary payload of a presigned download request.
 * @param {StoragePresignedUrlResponse} presigned
 * @returns {Promise<Response>}
 */
export const downloadWithPresignedRequest = async (presigned) => {
  if (!presigned || !presigned.url) {
    throw new Error('Presigned download information is required.');
  }

  const { url, method = 'GET', headers = {} } = presigned;
  const response = await fetch(url, {
    method,
    headers
  });

  if (!response.ok) {
    throw new Error('Failed to download file from storage.');
  }

  return response;
};
