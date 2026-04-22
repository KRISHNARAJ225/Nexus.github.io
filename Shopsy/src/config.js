// In dev, route through Vite proxy (/api → devtunnel). In prod, use the full URL.
export const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
