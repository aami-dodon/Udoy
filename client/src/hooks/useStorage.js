import { useCallback, useMemo } from 'react';

import {
  downloadWithPresignedRequest,
  requestPresignedDownloadUrl,
  requestPresignedUploadUrl,
  uploadWithPresignedRequest
} from '../features/storage/services/storageService.js';
import { useAuth } from './useAuth.js';

/**
 * React hook for interacting with MinIO through presigned URLs.
 * @returns {{
 *   getUploadUrl: (payload: import('@shared/types/storage').StoragePresignRequestPayload) => Promise<import('@shared/types/storage').StoragePresignedUrlResponse>,
 *   getDownloadUrl: (payload: import('@shared/types/storage').StoragePresignDownloadRequestPayload) => Promise<import('@shared/types/storage').StoragePresignedUrlResponse>,
 *   uploadWithPresignedRequest: typeof uploadWithPresignedRequest,
 *   downloadWithPresignedRequest: typeof downloadWithPresignedRequest
 * }}
 */
export const useStorage = () => {
  const { token } = useAuth();

  const getUploadUrl = useCallback(
    (payload) => requestPresignedUploadUrl(token, payload),
    [token]
  );

  const getDownloadUrl = useCallback(
    (payload) => requestPresignedDownloadUrl(token, payload),
    [token]
  );

  return useMemo(
    () => ({
      getUploadUrl,
      getDownloadUrl,
      uploadWithPresignedRequest,
      downloadWithPresignedRequest
    }),
    [getDownloadUrl, getUploadUrl]
  );
};
