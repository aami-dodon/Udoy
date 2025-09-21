import { fetchJson } from '../../../utils/api.js';

export const signupRequest = (payload) =>
  fetchJson('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const loginRequest = (payload) =>
  fetchJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const getProfile = (token) =>
  fetchJson('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((response) => response.user);
