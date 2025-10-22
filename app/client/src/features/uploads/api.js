import apiClient from '@/lib/http.js';

export async function requestUploadPresign(payload) {
  const { data } = await apiClient.post('/uploads/presign', payload);
  return data?.data || null;
}

export default {
  requestUploadPresign,
};
