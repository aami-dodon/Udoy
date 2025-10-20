const RAW_API_BASE_URL = (import.meta.env?.VITE_API_URL || '').trim();

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) {
    return '/api';
  }

  const hasProtocol = /^https?:\/\//i.test(baseUrl);
  const trimmed = baseUrl.replace(/\/+$/, '');

  if (hasProtocol) {
    return trimmed;
  }

  const normalized = trimmed.replace(/^\/+/, '');
  return normalized ? `/${normalized}` : '/api';
}

export const API_BASE_URL = normalizeBaseUrl(RAW_API_BASE_URL);

export function buildApiUrl(path = '') {
  const normalizedPath = String(path || '').replace(/^\/+/, '');

  if (!normalizedPath) {
    return API_BASE_URL;
  }

  return `${API_BASE_URL}${API_BASE_URL.endsWith('/') ? '' : '/'}${normalizedPath}`;
}
