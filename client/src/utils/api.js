const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const fetchJson = async (path, options = {}) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const target = `${API_BASE_URL}${normalizedPath}` || normalizedPath;

  const response = await fetch(target, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch API resource');
  }

  return response.json();
};
