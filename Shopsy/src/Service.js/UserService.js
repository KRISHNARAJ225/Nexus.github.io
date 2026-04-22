import apiFetch from './apiClient.js';

const BASE = '/api/v1/users';

export const getUsers = (page = 0, size = 1000, search = '', options = {}) =>
  apiFetch(`${BASE}?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}`, options);

export const getUser = (id) => apiFetch(`${BASE}/${id}`);

export const updateUser = (id, data) =>
  apiFetch(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteUser = (id) =>
  apiFetch(`${BASE}/${id}`, { method: 'DELETE' });

export default { getUsers, getUser, updateUser, deleteUser };
