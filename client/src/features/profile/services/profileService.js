import { fetchJson } from '../../../utils/api.js';

export const updateProfileRequest = (token, payload) =>
  fetchJson('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
