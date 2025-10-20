import apiClient from '@/lib/http.js';

export async function register(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  return data;
}

export async function login(payload) {
  const { data } = await apiClient.post('/auth/login', payload);
  return data;
}

export async function fetchSession() {
  const { data } = await apiClient.get('/auth/session');
  return data;
}

export async function refresh(tokens = {}) {
  const { refreshToken } = tokens;
  const { data } = await apiClient.post('/auth/refresh', refreshToken ? { refreshToken } : {});
  return data;
}

export async function logout(body = {}) {
  const { data } = await apiClient.post('/auth/logout', body);
  return data;
}

export async function verifyEmail(token) {
  const { data } = await apiClient.post('/auth/verify-email', { token });
  return data;
}

export async function resendVerification(email) {
  const { data } = await apiClient.post('/auth/resend-verification', { email });
  return data;
}

export async function requestPasswordReset(email) {
  const { data } = await apiClient.post('/auth/request-password-reset', { email });
  return data;
}

export async function resetPassword(payload) {
  const { data } = await apiClient.post('/auth/reset-password', payload);
  return data;
}

export async function guardianApproval(payload) {
  const { data } = await apiClient.post('/auth/guardian/approve', payload);
  return data;
}

export default {
  register,
  login,
  fetchSession,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
  guardianApproval,
};
