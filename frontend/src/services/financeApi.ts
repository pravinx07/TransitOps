import api from './api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicle?: { regNo: string; model: string };
  date: string;
  liters: number;
  fuelCost: number;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  tripRef: string;
  vehicleId: string;
  vehicle?: { regNo: string; model: string };
  toll: number;
  other: number;
  maintenance: number;
  status: 'PENDING' | 'AVAILABLE' | 'COMPLETED';
  notes?: string;
  date?: string;
  createdAt: string;
}

export interface OperationalCost {
  totalCost: number;
  breakdown: {
    fuel: number;
    maintenance: number;
  };
}

export const getFuelLogs = async (): Promise<FuelLog[]> => {
  const { data } = await api.get<ApiResponse<FuelLog[]>>('/finance/fuel');
  return data.data;
};

export const addFuelLog = async (logData: Partial<FuelLog>): Promise<FuelLog> => {
  const { data } = await api.post<ApiResponse<FuelLog>>('/finance/fuel', logData);
  return data.data;
};

export const getExpenses = async (): Promise<Expense[]> => {
  const { data } = await api.get<ApiResponse<Expense[]>>('/finance/expenses');
  return data.data;
};

export const addExpense = async (expenseData: Partial<Expense>): Promise<Expense> => {
  const { data } = await api.post<ApiResponse<Expense>>('/finance/expenses', expenseData);
  return data.data;
};

export const getOperationalCost = async (): Promise<OperationalCost> => {
  const { data } = await api.get<ApiResponse<OperationalCost>>('/finance/operational-cost');
  return data.data;
};
