import { fetchJson } from '../../../utils/api.js';

export const fetchAdminUsers = (token) =>
  fetchJson('/api/admin/users', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((response) => response.users);

export const updateAdminUser = (token, id, payload) =>
  fetchJson(`/api/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((response) => response.user);

export const deleteAdminUser = (token, id) =>
  fetchJson(`/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((response) => response.user);
