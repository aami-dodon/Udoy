# MinIO Integration

This integration encapsulates connectivity with the MinIO object storage service. It exposes helpers that the rest of the server uses to upload and retrieve files via presigned URLs.

## Files

- `minioClient.js` – Initializes the MinIO client, validates configuration, and exports helper utilities.
- `index.js` – Re-exports the public API for convenient importing.

## Configuration Requirements

`app/server/src/config/env.js` must provide a `minio` object with the following shape (see `.env.example` for defaults):

| Key | Description |
| --- | --- |
| `endpoint` | Hostname (or IP) for the MinIO server. |
| `port` | Optional number specifying the MinIO port. |
| `useSSL` | Boolean indicating whether to use HTTPS. |
| `accessKey` | Access key ID. |
| `secretKey` | Secret access key. |
| `region` | Optional region identifier (for S3-compatible deployments). |
| `bucket` | Default bucket used for uploads. |
| `publicBaseUrl` | Optional base URL for constructing publicly accessible object URLs. |
| `forceSignedDownloads` | Boolean flag that disables direct URLs and forces GET presigned URLs for downloads. |

Missing configuration triggers descriptive log messages and causes helper functions to throw a `MinioConfigError` when critical pieces are unavailable. This prevents silent failures while keeping the application boot sequence resilient.

## Public API

```js
import {
  minioClient,
  getMinioClient,
  getMinioBucket,
  isMinioConfigured,
  getMinioPublicUrl,
  getPresignedPutUrl,
  getPresignedGetUrl,
  MINIO_DEFAULT_EXPIRY_SECONDS,
  MINIO_MAX_EXPIRY_SECONDS,
} from '../../integrations/minio/index.js';
```

### Helper Behavior

- `getMinioClient()` returns the initialized `Client` instance or `null` if setup failed.
- `getMinioBucket()` reveals the default bucket name (or `null` when missing).
- `isMinioConfigured()` evaluates whether the client and bucket information are ready for use.
- `getPresignedPutUrl(objectKey, options)` generates a time-bound upload URL. Optional `contentType` is converted into required headers.
- `getPresignedGetUrl(objectKey, options)` produces a time-limited download URL. Optional `responseHeaders` are passed through to control content disposition.
- `getMinioPublicUrl(objectKey)` crafts a direct URL when `publicBaseUrl` is configured and `forceSignedDownloads` is disabled.

Both presigned helpers normalize object keys and clamp expirations between `MINIO_DEFAULT_EXPIRY_SECONDS` (15 minutes) and `MINIO_MAX_EXPIRY_SECONDS` (24 hours). Errors are logged and rethrown to aid troubleshooting.
