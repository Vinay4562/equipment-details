import axios from 'axios';

// Prefer explicit VITE_API_BASE; otherwise use localhost in dev, and "/api" in prod
const inferredBase = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname)
  ? 'http://localhost:5000/api'
  : '/api';

export const API_BASE = import.meta.env.VITE_API_BASE || inferredBase;

export const api = axios.create({ baseURL: API_BASE });

// Attach auth token when available
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// Entry username for privileged actions (used when prompting only for password)
export const ENTRY_USERNAME = import.meta.env.VITE_ENTRY_USERNAME || 'Shankarpally400kv';

// Resolve server-hosted upload URLs correctly across dev/prod
export function resolveUploadUrl(imagePath) {
  if (!imagePath) return '';
  if (/^(?:https?:)?\/\//i.test(imagePath)) return imagePath; // absolute http(s)
  if (/^data:/i.test(imagePath)) return imagePath; // data URI
  const origin = API_BASE.startsWith('http') ? new URL(API_BASE).origin : (typeof window !== 'undefined' ? window.location.origin : '');
  return `${origin}${imagePath}`;
}

export const fetchFeeders = (voltage) => api.get('/feeders', { params: { voltage } });
export const seedFeeders = () => api.post('/feeders/seed');
export const createEquipment = (formData) => api.post('/equipment', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
export const listEquipment = (params) => api.get('/equipment', { params });
export const getEquipment = (id) => api.get(`/equipment/${id}`);
export const deleteEquipment = (id) => api.delete(`/equipment/${id}`);