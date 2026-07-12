import { useMinimumLoading } from "../hooks/useMinimumLoading";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Route, MapPin, Clock, Truck, Package, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getVehicles } from '../services/vehiclesApi';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getTrips, createTrip, updateTripStatus, getAvailableVehicles, type Trip } from '../services/tripsApi';
import { getAvailableDrivers } from '../services/driversApi';
import { useAuth } from '../context/AuthContext';

const tripSchema = z.object({
  source: z.string().min(2, 'Source is required'),
  destination: z.string().min(2, 'Destination is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
  cargoWeight: z.number().min(1, 'Cargo weight is required'),
  plannedDistance: z.number().min(1, 'Distance is required'),
});

type TripFormData = z.infer<typeof tripSchema>;

export default function TripsPage() {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles
  });

  const showLoading = useMinimumLoading(isLoading, 800);
  const activeTrips = vehicles?.filter(v => v.status === 'ON_TRIP') || [];

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeLegendStatus, setActiveLegendStatus] = useState('DRAFT');
  
  // Data Fetching
  const { data: trips = [], isLoading: loadingTrips } = useQuery({ queryKey: ['trips'], queryFn: getTrips });
  const { data: availableVehicles = [] } = useQuery({ queryKey: ['availableVehicles'], queryFn: getAvailableVehicles });
  const { data: drivers = [] } = useQuery({ queryKey: ['availableDrivers'], queryFn: getAvailableDrivers });

  // Form setup
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: { cargoWeight: 0, plannedDistance: 0 }
  });

  const selectedVehicleId = watch('vehicleId');
  const cargoWeight = watch('cargoWeight');
  
  const selectedVehicle = vehicles.find((v: any) => v.id === selectedVehicleId);
  const capacityExceeded = selectedVehicle && (cargoWeight > selectedVehicle.capacityKg);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['availableDrivers'] });
      setActiveLegendStatus('DRAFT');
      toast.success('Trip created successfully');
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create trip');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateTripStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['availableDrivers'] });
      setActiveLegendStatus(variables.status);
      toast.success('Trip status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  const onSubmit = (data: TripFormData) => {
    if (capacityExceeded) return;
    createMutation.mutate(data);
  };

  const isManager = user?.role === 'FLEET_MANAGER';

  return (
    <div className="flex flex-col space-y-4 lg:space-y-6 animate-in fade-in duration-300 bg-[#F4F6FA] p-4 lg:p-6 rounded-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0A0C16] tracking-tight">Trip Dispatcher</h1>
      </div>

      {/* Lifecycle Legend */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-5 md:mb-6">Status Legend / Trip Lifecycle</h3>
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          
          <div className="absolute top-2.5 left-4 right-4 h-0.5 bg-gray-200 z-0" />
          
          {/* Jumping Circle */}
          <div 
            className={`absolute top-2.5 w-6 h-6 -mt-3 rounded-full border-4 border-white shadow-md z-20 transition-all duration-700 ease-bounce ${
              activeLegendStatus === 'DRAFT' ? 'bg-gray-600' :
              activeLegendStatus === 'DISPATCHED' ? 'bg-blue-500' :
              activeLegendStatus === 'COMPLETED' ? 'bg-emerald-500' :
              'bg-red-500'
            }`}
            style={{ 
              left: activeLegendStatus === 'DRAFT' ? '0%' : 
                    activeLegendStatus === 'DISPATCHED' ? '33.33%' : 
                    activeLegendStatus === 'COMPLETED' ? '66.66%' : 
                    '100%',
              transform: 'translateX(-50%)'
            }} 
          />

          <div className="relative z-10 flex flex-col items-center gap-2 w-0">
            <div className="w-3 h-3 rounded-full bg-gray-300 mt-1" />
            <span className={`text-sm font-semibold transition-colors duration-500 ${activeLegendStatus === 'DRAFT' ? 'text-gray-800' : 'text-gray-400'}`}>Draft</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2 w-0">
            <div className="w-3 h-3 rounded-full bg-gray-300 mt-1" />
            <span className={`text-sm font-semibold transition-colors duration-500 ${activeLegendStatus === 'DISPATCHED' ? 'text-blue-600' : 'text-gray-400'}`}>Dispatched</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2 w-0">
            <div className="w-3 h-3 rounded-full bg-gray-300 mt-1" />
            <span className={`text-sm font-semibold transition-colors duration-500 ${activeLegendStatus === 'COMPLETED' ? 'text-emerald-600' : 'text-gray-400'}`}>Completed</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2 w-0">
            <div className="w-3 h-3 rounded-full bg-gray-300 mt-1" />
            <span className={`text-sm font-semibold transition-colors duration-500 ${activeLegendStatus === 'CANCELLED' ? 'text-red-600' : 'text-gray-400'}`}>Cancelled</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* CREATE TRIP FORM */}
        {isManager && (
          <div className="lg:col-span-5 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-bold text-[#0A0C16] uppercase tracking-wider">Create Trip</h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Source</label>
                <input {...register('source')} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors" placeholder="Gandhinagar Depot" />
                {errors.source && <span className="text-xs text-red-500 mt-1">{errors.source.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Destination</label>
                <input {...register('destination')} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors" placeholder="Ahmedabad Hub" />
                {errors.destination && <span className="text-xs text-red-500 mt-1">{errors.destination.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Vehicle (Available Only)</label>
                <select {...register('vehicleId')} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none">
                  <option value="">Select Vehicle...</option>
                  {availableVehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.plateNumber} - {v.capacityKg} kg capacity</option>
                  ))}
                </select>
                {errors.vehicleId && <span className="text-xs text-red-500 mt-1">{errors.vehicleId.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Driver (Available Only)</label>
                <select {...register('driverId')} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none">
                  <option value="">Select Driver...</option>
                  {drivers.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {errors.driverId && <span className="text-xs text-red-500 mt-1">{errors.driverId.message}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Cargo Weight (kg)</label>
                  <input type="number" {...register('cargoWeight', { valueAsNumber: true })} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                  {errors.cargoWeight && <span className="text-xs text-red-500 mt-1">{errors.cargoWeight.message}</span>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Planned Dist (km)</label>
                  <input type="number" {...register('plannedDistance', { valueAsNumber: true })} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                  {errors.plannedDistance && <span className="text-xs text-red-500 mt-1">{errors.plannedDistance.message}</span>}
                </div>
              </div>

              {/* Validation Box */}
              {selectedVehicle && (
                <div className={`p-4 rounded-lg border ${capacityExceeded ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-300'}`}>
                  <p className={`text-sm font-semibold ${capacityExceeded ? 'text-red-700' : 'text-emerald-700'}`}>Vehicle Capacity: {selectedVehicle.capacityKg} kg</p>
                  <p className={`text-sm font-semibold ${capacityExceeded ? 'text-red-700' : 'text-emerald-700'}`}>Cargo Weight: {cargoWeight || 0} kg</p>
                  {capacityExceeded && (
                    <p className="text-sm font-bold text-red-600 mt-2 flex items-center gap-2">
                      <XCircle size={16} /> Capacity exceeded by {cargoWeight - selectedVehicle.capacityKg} kg - dispatch blocked
                    </p>
                  )}
                </div>
              )}

              <div className="mt-auto pt-4 flex gap-3">
                <button 
                  type="submit" 
                  disabled={createMutation.isPending || capacityExceeded}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold transition-all"
                >
                  {createMutation.isPending ? 'Creating...' : capacityExceeded ? 'Dispatch (Disabled)' : 'Dispatch Trip'}
                </button>
                <button type="button" onClick={() => reset()} className="px-6 bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold transition-all">
                  Clear
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LIVE BOARD */}
        <div className={`${isManager ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-[600px] lg:h-[700px]`}>
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-[#0A0C16] uppercase tracking-wider">Live Board</h2>
            {loadingTrips && <RefreshCw size={16} className="text-gray-400 animate-spin" />}
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {trips.length === 0 && !loadingTrips ? (
              <div className="text-center text-gray-500 py-10">No trips available.</div>
            ) : (
              trips.map((trip: Trip) => (
                <div key={trip.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-500/50 hover:shadow-md transition-all relative bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{trip.tripNumber}</span>
                      <h4 className="text-[#0A0C16] font-semibold text-lg flex items-center gap-2 mt-1">
                        {trip.source} <span className="text-gray-400">→</span> {trip.destination}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {trip.vehicle?.plateNumber || 'Unassigned'} / {trip.driver?.name || 'Unassigned'}
                      </p>
                      {trip.status === 'DRAFT' && <p className="text-xs text-gray-500 mt-1">Awaiting dispatch</p>}
                    </div>
                  </div>

                  <div className="flex flex-col mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-md ${
                        trip.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                        trip.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-700' :
                        trip.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {trip.status}
                      </span>
                      
                      {/* Actions for Manager/Driver based on status */}
                      <div className="flex gap-2">
                        {trip.status === 'DRAFT' && isManager && (
                          <>
                            <button onClick={() => statusMutation.mutate({ id: trip.id, status: 'DISPATCHED' })} className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm">Dispatch</button>
                            <button onClick={() => statusMutation.mutate({ id: trip.id, status: 'CANCELLED' })} className="px-3 py-1.5 text-xs font-bold bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded">Cancel</button>
                          </>
                        )}
                        {trip.status === 'DISPATCHED' && (
                          <button onClick={() => statusMutation.mutate({ id: trip.id, status: 'COMPLETED' })} className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm">Mark Completed</button>
                        )}
                      </div>
                    </div>

                    {/* DYNAMIC TRACE BAR */}
                    <div className="w-full relative px-4 py-2 mt-2">
                      <div className="flex justify-between items-center relative w-full">
                        
                        {/* Draft Node */}
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-4 h-4 rounded-full border-[3px] bg-white transition-colors duration-500 ${trip.status === 'DRAFT' ? 'border-gray-400 shadow-sm' : 'border-blue-500 bg-blue-500'}`} />
                          <span className={`text-[10px] font-bold ${trip.status === 'DRAFT' ? 'text-gray-500' : 'text-blue-600'} absolute -bottom-5 whitespace-nowrap`}>Draft</span>
                        </div>
                        
                        {/* Line 1 */}
                        <div className="flex-1 h-0.5 bg-gray-200 relative -mx-0.5 z-0">
                           <div className="absolute inset-0 bg-blue-500 transition-all duration-700 ease-in-out origin-left" style={{ transform: trip.status !== 'DRAFT' ? 'scaleX(1)' : 'scaleX(0)' }} />
                        </div>

                        {/* Dispatched Node */}
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-4 h-4 rounded-full border-[3px] bg-white transition-colors duration-500 ${
                            trip.status === 'DRAFT' ? 'border-gray-200' : 
                            trip.status === 'DISPATCHED' ? 'border-blue-500 shadow-sm' : 
                            trip.status === 'CANCELLED' ? 'border-red-500 bg-red-500' :
                            'border-emerald-500 bg-emerald-500'
                          }`} />
                          <span className={`text-[10px] font-bold ${
                            trip.status === 'DRAFT' ? 'text-gray-400' : 
                            trip.status === 'CANCELLED' ? 'text-red-500' :
                            trip.status === 'DISPATCHED' ? 'text-blue-600' : 'text-emerald-600'
                          } absolute -bottom-5 whitespace-nowrap`}>Dispatched</span>
                        </div>

                        {/* Line 2 */}
                        <div className="flex-1 h-0.5 bg-gray-200 relative -mx-0.5 z-0">
                           <div className={`absolute inset-0 ${trip.status === 'CANCELLED' ? 'bg-red-500' : 'bg-emerald-500'} transition-all duration-700 ease-in-out origin-left`} style={{ transform: trip.status === 'COMPLETED' || trip.status === 'CANCELLED' ? 'scaleX(1)' : 'scaleX(0)' }} />
                        </div>

                        {/* End Node (Completed/Cancelled) */}
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-4 h-4 rounded-full border-[3px] bg-white transition-colors duration-500 ${
                            trip.status === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500 shadow-sm' : 
                            trip.status === 'CANCELLED' ? 'border-red-500 bg-red-500 shadow-sm' : 
                            'border-gray-200'
                          }`} />
                          <span className={`text-[10px] font-bold ${
                            trip.status === 'COMPLETED' ? 'text-emerald-600' : 
                            trip.status === 'CANCELLED' ? 'text-red-600' : 
                            'text-gray-400'
                          } absolute -bottom-5 whitespace-nowrap`}>{trip.status === 'CANCELLED' ? 'Cancelled' : 'Completed'}</span>
                        </div>
                      </div>
                      <div className="h-4" /> {/* Spacer for absolute text */}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">On Complete: Vehicle & Driver immediately become available</p>
          </div>
        </div>

      </div>
    </div>
  );
}
