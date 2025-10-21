import apiClient from '@/lib/http.js';

export async function fetchTopics(params = {}) {
  const response = await apiClient.get('/topics', { params });
  return response.data?.data || { items: [], page: 1, pageSize: 20, total: 0 };
}

export async function createTopic(payload) {
  const response = await apiClient.post('/topics', payload);
  return response.data?.data?.topic;
}

export async function getTopic(id) {
  const response = await apiClient.get(`/topics/${id}`);
  return response.data?.data?.topic;
}

export async function updateTopic(id, payload) {
  const response = await apiClient.patch(`/topics/${id}`, payload);
  return response.data?.data?.topic;
}

export async function submitTopic(id, payload) {
  const response = await apiClient.post(`/topics/${id}/submit`, payload);
  return response.data?.data?.topic;
}

export async function reviewTopic(id, payload) {
  const response = await apiClient.post(`/topics/${id}/review`, payload);
  return response.data?.data?.topic;
}

export async function publishTopic(id, payload) {
  const response = await apiClient.post(`/topics/${id}/publish`, payload);
  return response.data?.data?.topic;
}

export async function createTopicRevision(id, payload) {
  const response = await apiClient.post(`/topics/${id}/revise`, payload);
  return response.data?.data?.topic;
}

export async function fetchTopicHistory(id) {
  const response = await apiClient.get(`/topics/${id}/history`);
  return response.data?.data?.history || [];
}

export default {
  fetchTopics,
  createTopic,
  getTopic,
  updateTopic,
  submitTopic,
  reviewTopic,
  publishTopic,
  createTopicRevision,
  fetchTopicHistory,
};
