import apiClient from '@/lib/http.js';

export async function fetchUsers(params = {}) {
  const { data } = await apiClient.get('/users', { params });
  return data;
}

export async function fetchUser(id) {
  const { data } = await apiClient.get(`/users/${id}`);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return data;
}

export async function setUserRoles(id, roles) {
  const { data } = await apiClient.post(`/users/${id}/roles`, { roles });
  return data;
}

export async function removeUserRole(id, roleName) {
  const { data } = await apiClient.delete(`/users/${id}/roles/${encodeURIComponent(roleName)}`);
  return data;
}

export async function fetchRoleCatalog() {
  const { data } = await apiClient.get('/roles');
  return data;
}

export default {
  fetchUsers,
  fetchUser,
  updateUser,
  setUserRoles,
  removeUserRole,
  fetchRoleCatalog,
};
