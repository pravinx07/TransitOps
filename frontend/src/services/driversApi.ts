import api from './api.ts';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contactNumber: string;
  safetyScore: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'ON_LEAVE' | 'OFF_DUTY' | 'SUSPENDED';
}

export const getDrivers = async (): Promise<Driver[]> => {
  const { data } = await api.get<ApiResponse<Driver[]>>('/drivers');
  return data.data;
};

export const getAvailableDrivers = async (): Promise<Driver[]> => {
  const { data } = await api.get<ApiResponse<Driver[]>>('/drivers/available');
  return data.data;
};

export const createDriver = async (driverData: Partial<Driver>): Promise<Driver> => {
  const { data } = await api.post<ApiResponse<Driver>>('/drivers', driverData);
  return data.data;
};

export const updateDriver = async (id: string, driverData: Partial<Driver>): Promise<Driver> => {
  const { data } = await api.put<ApiResponse<Driver>>(`/drivers/${id}`, driverData);
  return data.data;
};

export const deleteDriver = async (id: string): Promise<void> => {
  await api.delete(`/drivers/${id}`);
};
