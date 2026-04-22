import apiFetch from './apiClient.js';

const BASE = '/api/v1/product';

export const getProducts   = (page = 0, size = 1000, search = '', options = {}) => 
  apiFetch(`${BASE}?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}`, options);
export const getProduct    = (id)       => apiFetch(`${BASE}/${id}`);
export const createProduct = (data)     => apiFetch(BASE,           { method: 'POST',   body: JSON.stringify(data) });
export const updateProduct = (id, data) => apiFetch(`${BASE}/${id}`, { method: 'PUT',    body: JSON.stringify(data) });
export const deleteProduct = (id)       => apiFetch(`${BASE}/${id}`, { method: 'DELETE' });

export default { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
