import apiClient from '@/lib/http.js';

export async function fetchMyProfile() {
  const response = await apiClient.get('/profile/me');
  return response.data?.data || null;
}

export async function updateMyProfile(payload) {
  const response = await apiClient.patch('/profile/me', payload);
  return response.data?.data || null;
}

export default {
  fetchMyProfile,
  updateMyProfile,
};
