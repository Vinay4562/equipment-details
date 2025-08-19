import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const api = axios.create({ baseURL: API_BASE });

// Attach auth token when available
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

export const fetchFeeders = (voltage) => api.get('/feeders', { params: { voltage } });
export const seedFeeders = () => api.post('/feeders/seed');
export const createEquipment = (formData) => api.post('/equipment', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
export const listEquipment = (params) => api.get('/equipment', { params });
export const getEquipment = (id) => api.get(`/equipment/${id}`);
export const deleteEquipment = (id) => api.delete(`/equipment/${id}`);