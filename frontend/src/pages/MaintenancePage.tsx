import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  getMaintenanceRecords, 
  createMaintenanceRecord, 
  completeMaintenanceRecord,
  getAvailableVehicles,
  type MaintenanceRecord 
} from '../services/maintenanceApi';
import { Wrench, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  serviceType: z.string().min(3, 'Service type is required (min 3 chars)'),
  cost: z.number().min(1, 'Cost must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Data Fetching
  const { data: records = [], isLoading: loadingRecords } = useQuery({ 
    queryKey: ['maintenance'], 
    queryFn: getMaintenanceRecords 
  });
  
  const { data: availableVehicles = [] } = useQuery({ 
    queryKey: ['availableVehicles'], 
    queryFn: getAvailableVehicles 
  });

  // Form setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createMaintenanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] }); // from trips
      toast.success('Maintenance record created. Vehicle moved to IN_MAINTENANCE.');
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create record');
    }
  });

  const completeMutation = useMutation({
    mutationFn: completeMaintenanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
      toast.success('Maintenance completed. Vehicle is now AVAILABLE.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete maintenance');
    }
  });

  const onSubmit = (data: MaintenanceFormData) => {
    createMutation.mutate(data);
  };

  const isManager = user?.role === 'FLEET_MANAGER';

  return (
    <div className="flex flex-col space-y-4 lg:space-y-6 animate-in fade-in duration-300 bg-transparent p-4 lg:p-0 rounded-2xl min-h-full lg:min-h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">Maintenance</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* LOG SERVICE RECORD FORM */}
        {isManager && (
          <div className="lg:col-span-4 flex flex-col bg-[#0A0C16] border border-[#1E2336] rounded-xl overflow-hidden shadow-sm h-fit">
            <div className="px-6 py-4 border-b border-[#1E2336] bg-[#0A0C16]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Log Service Record</h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Vehicle</label>
                <select {...register('vehicleId')} className="w-full bg-[#131826] border border-[#1E2336] rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none">
                  <option value="">Select Vehicle...</option>
                  {availableVehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.plateNumber}</option>
                  ))}
                </select>
                {errors.vehicleId && <span className="text-xs text-red-500 mt-1">{errors.vehicleId.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Service Type</label>
                <input {...register('serviceType')} className="w-full bg-[#131826] border border-[#1E2336] rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors" placeholder="e.g. Oil Change" />
                {errors.serviceType && <span className="text-xs text-red-500 mt-1">{errors.serviceType.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Cost</label>
                <input type="number" {...register('cost', { valueAsNumber: true })} className="w-full bg-[#131826] border border-[#1E2336] rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors" placeholder="Amount" />
                {errors.cost && <span className="text-xs text-red-500 mt-1">{errors.cost.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Date</label>
                <input type="date" {...register('date')} className="w-full bg-[#131826] border border-[#1E2336] rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors" />
                {errors.date && <span className="text-xs text-red-500 mt-1">{errors.date.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Status</label>
                <input type="text" value="Active" disabled className="w-full bg-[#131826]/50 border border-[#1E2336] rounded-lg px-4 py-2.5 text-gray-500 outline-none" />
              </div>

              <div className="mt-2 pt-2">
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* SERVICE LOG TABLE */}
        <div className={`${isManager ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col bg-[#0A0C16] border border-[#1E2336] rounded-xl overflow-hidden shadow-sm h-[600px] lg:h-auto`}>
          <div className="px-6 py-4 border-b border-[#1E2336] bg-[#0A0C16] flex justify-between items-center">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Service Log</h2>
            {loadingRecords && <RefreshCw size={16} className="text-gray-400 animate-spin" />}
          </div>
          
          <div className="overflow-x-auto flex-1 p-0 m-0">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-[#1E2336] text-xs font-semibold text-gray-400 uppercase tracking-wider bg-[#131826]/30">
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Cost</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2336]">
                {records.length === 0 && !loadingRecords ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No service records found.</td>
                  </tr>
                ) : (
                  records.map((record: MaintenanceRecord) => (
                    <tr key={record.id} className="hover:bg-[#131826] transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-200">{record.vehicle.plateNumber}</td>
                      <td className="px-6 py-4 text-gray-400">{record.serviceType}</td>
                      <td className="px-6 py-4 text-gray-400 font-medium">₹{record.cost.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          {record.status === 'ACTIVE' ? (
                            <>
                              <span className="inline-flex justify-center items-center px-3 py-1.5 min-w-[80px] bg-orange-500/10 text-orange-400 text-sm font-bold rounded-lg border border-orange-500/20">
                                In Shop
                              </span>
                              {isManager && (
                                <button 
                                  onClick={() => completeMutation.mutate(record.id)}
                                  disabled={completeMutation.isPending}
                                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50 text-emerald-400 text-sm font-bold rounded-lg border border-emerald-500/20 transition-all whitespace-nowrap flex items-center gap-1"
                                  title="Mark maintenance as Completed"
                                >
                                  <CheckCircle size={14} />
                                  Complete
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="inline-flex justify-center items-center gap-1.5 px-3 py-1.5 min-w-[80px] bg-emerald-500/10 text-emerald-400 text-sm font-bold rounded-lg border border-emerald-500/20">
                              <CheckCircle size={14} />
                              Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
