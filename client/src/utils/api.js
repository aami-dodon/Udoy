const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const fetchJson = async (path, options = {}) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const target = `${API_BASE_URL}${normalizedPath}` || normalizedPath;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(target, {
    ...options,
    headers
  });

  if (!response.ok) {
    let message = 'Failed to fetch API resource';
    try {
      const errorBody = await response.json();
      message = errorBody.message || message;
    } catch (error) {
      const errorText = await response.text();
      if (errorText) {
        message = errorText;
      }
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};
