import apiFetch from './apiClient.js';

const BASE = '/api/v1/orders';

export const getOrders = (page = 0, size = 1000, search = '', options = {}) =>
  apiFetch(`${BASE}?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}`, options);
export const getOrder = (id) => apiFetch(`${BASE}/${id}`);
export const getOrderByCode = (orderCode) => apiFetch(`${BASE}/code/${orderCode}`);
export const createOrder = (data) => apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) });
export const updateOrder = (id, data) => apiFetch(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateOrderStatus = (id, status) => apiFetch(`${BASE}/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' });
export const updateOrderPaymentStatus = (id, paymentStatus) => apiFetch(`${BASE}/${id}/payment?paymentStatus=${encodeURIComponent(paymentStatus)}`, { method: 'PUT' });
export const deleteOrder = (id) => apiFetch(`${BASE}/${id}`, { method: 'DELETE' });

export default { getOrders, getOrder, getOrderByCode, createOrder, updateOrder, updateOrderStatus, updateOrderPaymentStatus, deleteOrder };
