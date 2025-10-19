const DEFAULT_OBJECT_PREFIX = 'editor';

function resolveFetch(fetchImpl) {
  if (typeof fetchImpl === 'function') {
    return fetchImpl;
  }

  if (typeof fetch === 'function') {
    return fetch.bind(globalThis);
  }

  throw new Error('A fetch implementation must be provided to perform uploads.');
}

function slugifyFileName(name) {
  if (!name || typeof name !== 'string') {
    return 'file';
  }

  const baseName = name.replace(/\.[^/.]+$/, '');
  const extensionMatch = name.match(/\.([^.]+)$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';
  const slug =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'file';

  return extension ? `${slug}.${extension}` : slug;
}

function createObjectKeyPrefix(prefix) {
  if (typeof prefix !== 'string' || !prefix.trim()) {
    return DEFAULT_OBJECT_PREFIX;
  }

  return prefix.trim().replace(/\/+$/u, '');
}

export function generateEditorObjectKey(file, { prefix, includeFileName = true } = {}) {
  const resolvedPrefix = createObjectKeyPrefix(prefix);
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  const randomSuffix = Math.random().toString(36).slice(2, 10);
  const baseFileName = includeFileName && file?.name ? slugifyFileName(file.name) : 'asset';

  return `${resolvedPrefix}/${timestamp}-${randomSuffix}-${baseFileName}`;
}

function normalizeBaseUrl(baseUrl) {
  if (typeof baseUrl !== 'string' || !baseUrl) {
    return '';
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function buildAuthHeaders(token, extraHeaders = {}) {
  const headers = { ...extraHeaders };

  if (token && typeof token === 'string') {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function requestEditorPresignedUrl({
  objectKey,
  file,
  apiBaseUrl = '/api',
  operation = 'put',
  fetchImpl,
  token,
  headers,
  additionalPayload,
} = {}) {
  if (!objectKey) {
    throw new Error('objectKey is required to request a presigned URL.');
  }

  const fetcher = resolveFetch(fetchImpl);
  const normalizedBaseUrl = normalizeBaseUrl(apiBaseUrl);
  const url = `${normalizedBaseUrl}/uploads/presign`;
  const body = {
    objectKey,
    operation,
    contentType: file?.type,
    ...(additionalPayload && typeof additionalPayload === 'object' ? additionalPayload : {}),
  };

  const response = await fetcher(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(token, headers),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorMessage = `Failed to request presigned URL (status ${response.status})`;
    throw new Error(errorMessage);
  }

  const payload = await response.json();

  if (!payload?.data?.url) {
    throw new Error('Presigned URL response was missing required fields.');
  }

  return payload.data;
}

export async function uploadFileToPresignedUrl({ presign, file, fetchImpl } = {}) {
  if (!presign?.url) {
    throw new Error('A presign descriptor with a URL is required to upload.');
  }

  const fetcher = resolveFetch(fetchImpl);
  const method = presign.method || 'PUT';
  const headers = { ...(presign.headers || {}) };

  if (!headers['Content-Type'] && file?.type) {
    headers['Content-Type'] = file.type;
  }

  const response = await fetcher(presign.url, {
    method,
    headers,
    body: file,
  });

  if (!response.ok) {
    const errorMessage = `Uploading file to MinIO failed (status ${response.status})`;
    throw new Error(errorMessage);
  }

  return response;
}

export async function uploadEditorAsset(file, {
  apiBaseUrl = '/api',
  fetchImpl,
  token,
  prefix,
  objectKey: providedObjectKey,
  includeFileName = true,
  additionalPayload,
  requestHeaders,
} = {}) {
  if (!file) {
    throw new Error('A file must be provided for upload.');
  }

  const objectKey = providedObjectKey || generateEditorObjectKey(file, { prefix, includeFileName });
  const presign = await requestEditorPresignedUrl({
    objectKey,
    file,
    apiBaseUrl,
    operation: 'put',
    fetchImpl,
    token,
    headers: requestHeaders,
    additionalPayload,
  });

  await uploadFileToPresignedUrl({ presign, file, fetchImpl });

  const publicUrl = presign.publicUrl || presign.url?.split('?')[0];

  return {
    objectKey,
    bucket: presign.bucket,
    url: publicUrl,
    uploadUrl: presign.url,
    expiresAt: presign.expiresAt,
    method: presign.method || 'PUT',
  };
}
