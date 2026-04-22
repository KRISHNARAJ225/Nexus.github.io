import apiFetch from './apiClient.js';

const BASE = '/api/v1/customers';

export const getCustomers    = (page = 0, size = 1000, search = '', options = {}) => 
  apiFetch(`${BASE}?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}`, options);
export const getCustomer     = (id)       => apiFetch(`${BASE}/${id}`);
export const createCustomer  = (data)     => apiFetch(BASE,{ method: 'POST',   body: JSON.stringify(data) });
export const updateCustomer  = (id, data) => apiFetch(`${BASE}/${id}`, { method: 'PUT',    body: JSON.stringify(data) });
export const deleteCustomer  = (id)       => apiFetch(`${BASE}/${id}`, { method: 'DELETE' });

export default { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
