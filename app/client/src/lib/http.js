import axios from 'axios';
import { buildApiUrl } from './api.js';

const apiClient = axios.create({
  baseURL: buildApiUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAuthHeader(token) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export default apiClient;
