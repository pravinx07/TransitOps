import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchDashboardMetrics = async (filters?: any) => {
  try {
    const { data } = await api.get('/dashboard/metrics', { params: filters });
    return data.data || data;
  } catch (error) {
    throw error;
  }
};

export const fetchAnalytics = async () => {
  try {
    const { data } = await api.get('/analytics');
    return data.data || data;
  } catch (error) {
    throw error;
  }
};

export default api;
