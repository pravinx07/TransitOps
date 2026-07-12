import api from './api';

export interface Trip {
  id: string;
  tripNumber: string;
  source: string;
  destination: string;
  cargoWeight: number;
  plannedDistance: number;
  status: 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';
  vehicleId?: string;
  driverId?: string;
  vehicle?: any;
  driver?: any;
}

export const getTrips = async (): Promise<Trip[]> => {
  const { data } = await api.get('/trips');
  return data.data || [];
};

export const createTrip = async (tripData: Partial<Trip>): Promise<Trip> => {
  const { data } = await api.post('/trips', tripData);
  return data.data;
};

export const updateTripStatus = async (id: string, status: string): Promise<Trip> => {
  const { data } = await api.put(`/trips/${id}/status`, { status });
  return data.data;
};

export const getAvailableVehicles = async (): Promise<any[]> => {
  const { data } = await api.get('/vehicles/available');
  return data.data || [];
};
