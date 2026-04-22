import apiFetch from './apiClient.js';

const BASE = '/api/v1/stocks';

export const getStocks = (page = 0, size = 1000, options = {}) =>
  apiFetch(`${BASE}?page=${page}&size=${size}`, options);

export const createStock = (data) =>
  apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) });

export const updateStock = (id, data) =>
  apiFetch(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteStock = (id) =>
  apiFetch(`${BASE}/${id}`, { method: 'DELETE' });

export default { getStocks, createStock, updateStock, deleteStock };
