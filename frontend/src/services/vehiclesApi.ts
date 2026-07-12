import api from './api';

export interface Vehicle {
  id: string;
  regNo: string;
  model: string;
  type: string;
  capacity: string;
  odometer: number;
  avgCost: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';
}

export const getVehicles = async (): Promise<Vehicle[]> => {
  const { data } = await api.get('/vehicles');
  return data.data;
};
