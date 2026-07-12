import api from './api';

export interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  capacityKg: number;
  status: string;
}

export interface MaintenanceRecord {
  id: string;
  serviceType: string;
  cost: number;
  date: string;
  status: 'ACTIVE' | 'COMPLETED';
  vehicleId: string;
  vehicle: Vehicle;
  createdAt: string;
  updatedAt: string;
}

export const getMaintenanceRecords = async (): Promise<MaintenanceRecord[]> => {
  const response = await api.get('/maintenance');
  return response.data.data || response.data; // Handle both wrapped and unwrapped formats
};

export const createMaintenanceRecord = async (data: {
  vehicleId: string;
  serviceType: string;
  cost: number;
  date: string;
}): Promise<MaintenanceRecord> => {
  const response = await api.post('/maintenance', data);
  return response.data.data || response.data;
};

export const completeMaintenanceRecord = async (id: string): Promise<MaintenanceRecord> => {
  const response = await api.put(`/maintenance/${id}/complete`);
  return response.data.data || response.data;
};

export const getAvailableVehicles = async (): Promise<Vehicle[]> => {
  const response = await api.get('/vehicles/available');
  return response.data.data || response.data;
};
