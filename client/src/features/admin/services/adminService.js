import { fetchJson } from '../../../utils/api.js';

/**
 * @typedef {import('@shared/types/admin').AdminUserCollectionResponse} AdminUserCollectionResponse
 * @typedef {import('@shared/types/admin').AdminUserResponse} AdminUserResponse
 */

/**
 * @param {string} token
 * @returns {Promise<AdminUserCollectionResponse['users']>}
 */
export const fetchAdminUsers = (token) =>
  fetchJson('/api/admin/users', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((response) => response.users);

/**
 * @param {string} token
 * @param {string} id
 * @param {{ name?: string; role?: string; isVerified?: boolean; isActive?: boolean }} payload
 * @returns {Promise<AdminUserResponse['user']>}
 */
export const updateAdminUser = (token, id, payload) =>
  fetchJson(`/api/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((response) => response.user);

/**
 * @param {string} token
 * @param {string} id
 * @returns {Promise<AdminUserResponse['user']>}
 */
export const deleteAdminUser = (token, id) =>
  fetchJson(`/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((response) => response.user);
