import { fetchJson } from '../../../utils/api.js';

/**
 * @typedef {import('@shared/types/auth').SignupResponse} SignupResponse
 * @typedef {import('@shared/types/auth').LoginResponse} LoginResponse
 * @typedef {import('@shared/types/auth').AuthenticatedUserResponse} AuthenticatedUserResponse
 * @typedef {import('@shared/types/auth').VerifyEmailResult} VerifyEmailResult
 * @typedef {import('@shared/types/auth').ResetPasswordResult} ResetPasswordResult
 * @typedef {import('@shared/types/auth').ResendVerificationResponse} ResendVerificationResponse
 */

/**
 * @param {{ name: string; email: string; password: string; role: string }} payload
 * @returns {Promise<SignupResponse>}
 */
export const signupRequest = (payload) =>
  fetchJson('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

/**
 * @param {{ email: string; password: string }} payload
 * @returns {Promise<LoginResponse>}
 */
export const loginRequest = (payload) =>
  fetchJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

/**
 * @param {string} token
 * @returns {Promise<AuthenticatedUserResponse>}
 */
export const getAccount = (token) =>
  fetchJson('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((response) => response.user);

/**
 * @param {string} token
 * @returns {Promise<VerifyEmailResult>}
 */
export const verifyEmailRequest = (token) => fetchJson(`/api/auth/verify/${token}`);

/**
 * @param {string} email
 * @returns {Promise<{ message: string; supportEmail?: string }>}
 */
export const forgotPasswordRequest = (email) =>
  fetchJson('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });

/**
 * @param {{ token: string; password: string }} params
 * @returns {Promise<ResetPasswordResult>}
 */
export const resetPasswordRequest = ({ token, password }) =>
  fetchJson('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password })
  });

/**
 * @param {string} email
 * @returns {Promise<ResendVerificationResponse>}
 */
export const resendVerificationRequest = (email) =>
  fetchJson('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
