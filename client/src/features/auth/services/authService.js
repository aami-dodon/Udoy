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

export const verifyEmailRequest = (token) => fetchJson(`/api/auth/verify/${token}`);

export const forgotPasswordRequest = (email) =>
  fetchJson('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });

export const resetPasswordRequest = ({ token, password }) =>
  fetchJson('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password })
  });

export const resendVerificationRequest = (email) =>
  fetchJson('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
