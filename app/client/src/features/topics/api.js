import apiClient from '@/lib/http.js';

function extractTopic(response) {
  return response?.data?.topic || null;
}

function extractComment(response) {
  return response?.data?.comment || null;
}

export async function listTopics(params = {}) {
  const { data } = await apiClient.get('/topics', { params });
  return data?.data || { total: 0, page: 1, pageSize: 20, items: [] };
}

export async function getTopic(id, { full = true } = {}) {
  const { data } = await apiClient.get(`/topics/${id}`, { params: { full } });
  return extractTopic(data?.data ? { data: data.data } : data);
}

export async function createTopic(payload) {
  const { data } = await apiClient.post('/topics', payload);
  return extractTopic(data?.data ? { data: data.data } : data);
}

export async function updateTopic(id, payload) {
  const { data } = await apiClient.patch(`/topics/${id}`, payload);
  return extractTopic(data?.data ? { data: data.data } : data);
}

export async function submitTopic(id, payload = {}) {
  const { data } = await apiClient.post(`/topics/${id}/submit`, payload);
  return extractTopic(data?.data ? { data: data.data } : data);
}

export async function reviewTopic(id, payload) {
  const { data } = await apiClient.post(`/topics/${id}/review`, payload);
  return extractTopic(data?.data ? { data: data.data } : data);
}

export async function publishTopic(id, payload = {}) {
  const { data } = await apiClient.post(`/topics/${id}/publish`, payload);
  return extractTopic(data?.data ? { data: data.data } : data);
}

export async function addTopicComment(id, payload) {
  const { data } = await apiClient.post(`/topics/${id}/comments`, payload);
  return extractComment(data?.data ? { data: data.data } : data);
}

export default {
  listTopics,
  getTopic,
  createTopic,
  updateTopic,
  submitTopic,
  reviewTopic,
  publishTopic,
  addTopicComment,
};
