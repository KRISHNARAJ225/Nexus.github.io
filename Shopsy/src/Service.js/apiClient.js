import { API_BASE_URL } from '../config.js';

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { 
      credentials: 'include',
      ...options, 
      headers, 
      signal: controller.signal 
    });
  } finally {
    clearTimeout(timeout);
  }
  if (res.status === 204) return null;

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { message: text }; }

  if (!res.ok) throw new Error(json?.message || `Error ${res.status}`);

  // Unwrap Spring Boot wrapper: { HttpStatus, message, data }
  const result = json?.data !== undefined ? json.data : json;

  // DEBUG: log raw backend response so field names can be verified
  console.log(`[API] ${path}`, result);

  return result;
};

export default apiFetch;
