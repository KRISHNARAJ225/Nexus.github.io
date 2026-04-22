import apiFetch from './apiClient.js';

const BASE = '/api/v1/divisions';

export const getCategories   = (page = 0, size = 1000, search = '', options = {}) => 
  apiFetch(`${BASE}?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}`, options);
export const getCategory     = (id)       => apiFetch(`${BASE}/${id}`);
export const createCategory  = (data)     => apiFetch(BASE,           { method: 'POST',   body: JSON.stringify(data) });
export const updateCategory  = (id, data) => apiFetch(`${BASE}/${id}`, { method: 'PUT',    body: JSON.stringify(data) });
export const deleteCategory  = (id)       => apiFetch(`${BASE}/${id}`, { method: 'DELETE' });

export default { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
