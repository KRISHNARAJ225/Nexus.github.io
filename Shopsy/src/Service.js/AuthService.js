import { API_BASE_URL } from '../config.js';

const apiFetch = async (path, body) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include'
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { message: text }; }


  if (!res.ok) {
    throw new Error(data?.data?.message || data?.message || `Error ${res.status}`);
  }
  return data;
};

// POST /api/v1/auth/login → { HttpStatus, message, data: { token, username, email, role } }
export const loginUser = (username, password) =>
  apiFetch('/api/v1/auth/login', { username, password });

// POST /api/v1/auth/register
export const registerUser = ({ name, username, email, phone, password }) =>
  apiFetch('/api/v1/auth/register', { name, username, email, phone, password });

// Validate token by calling a protected endpoint — returns true if valid
export const validateToken = async (token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/token/validate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
};

// Change password
export const changePassword = async (token, currentPassword, newPassword) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { message: text }; }
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
  return data;
};

// Logout — calls backend if endpoint exists, always clears local storage
export const logoutUser = async (token) => {
  try {
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch {
    // ignore — local cleanup happens regardless
  } finally {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }
};

export default { loginUser, registerUser, validateToken, logoutUser, changePassword };
