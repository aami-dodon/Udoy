import { fetchJson } from '../../../utils/api.js';

/**
 * @typedef {import('@shared/types/account').AccountProfileUpdateResponse} AccountProfileUpdateResponse
 */

/**
 * @param {string} token
 * @param {{ name?: string; email?: string; currentPassword?: string; newPassword?: string }} payload
 * @returns {Promise<AccountProfileUpdateResponse>}
 */
export const updateProfileRequest = (token, payload) =>
  fetchJson('/api/account/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
