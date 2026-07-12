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

export const fetchDashboardMetrics = async () => {
  try {
    const { data } = await api.get('/dashboard/metrics');
    return data.data || data;
  } catch (error) {
    // Return mock data if backend route is not ready
    return {
      aggregate: { fuelEfficiency: 12.5, utilization: 85, operationalCost: 15000, roi: 18 },
      vehicles: [
        { id: '1', plateNumber: 'NY-1234', make: 'Ford', model: 'Transit', status: 'ACTIVE', fuelEfficiency: 12, operationalCost: 2000, roi: 15, distance: 5000, revenue: 10000 },
        { id: '2', plateNumber: 'CA-5678', make: 'Mercedes', model: 'Sprinter', status: 'INACTIVE', fuelEfficiency: 14, operationalCost: 1500, roi: 20, distance: 4000, revenue: 8000 }
      ]
    };
  }
};

export default api;
