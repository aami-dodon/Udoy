import { fetchJson } from '../../../utils/api.js';

/**
 * @typedef {import('@shared/types/account').AccountUpdateResponse} AccountUpdateResponse
 */

/**
 * @param {string} token
 * @param {{ name?: string; email?: string; currentPassword?: string; newPassword?: string }} payload
 * @returns {Promise<AccountUpdateResponse>}
 */
export const updateAccountRequest = (token, payload) =>
  fetchJson('/api/account', {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
