import { useMinimumLoading } from "../hooks/useMinimumLoading";
import { useQuery } from '@tanstack/react-query';
import { Route, MapPin, Clock } from 'lucide-react';
import { getVehicles } from '../services/vehiclesApi';


export default function TripsPage() {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles
  });

  const showLoading = useMinimumLoading(isLoading, 800);
  const activeTrips = vehicles?.filter(v => v.status === 'ON_TRIP') || [];

  return (
    <div className="h-full flex flex-col space-y-6 font-sans animate-in fade-in duration-300 pb-10">
      
      {/* Standardized Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1E2336]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Route className="w-6 h-6 text-indigo-400" />
            Active Trips
          </h1>
          <p className="text-xs text-gray-500 mt-1">Monitor all ongoing fleet journeys</p>
        </div>
        <div className="text-xs font-semibold bg-[#4F46E5]/20 text-indigo-300 px-4 py-2 rounded-lg border border-[#4F46E5]/30 flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          {activeTrips.length} Ongoing Trips
        </div>
      </div>

      <div className="bg-[#0A0C16]/50 border border-[#1E2336] rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#1E2336] text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-[#111422]">
                <th className="px-6 py-4">Trip ID</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Route Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Est. Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2336] text-xs">
              {showLoading ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-[#1E2336] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-[#1E2336] rounded mb-1"></div><div className="h-3 w-16 bg-[#1E2336] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-[#1E2336] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 bg-[#1E2336] rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-[#1E2336] rounded"></div></td>
                  </tr>
                ))
              ) : activeTrips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Route className="w-8 h-8 text-[#1E2336]" />
                      <span>No active trips found. Assign a vehicle to a trip to see it here.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                activeTrips.map((vehicle, idx) => (
                  <tr key={vehicle.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono text-gray-300">TRP-{String(idx + 1001).padStart(4, '0')}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-300 font-medium">{vehicle.regNo}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{vehicle.model} ({vehicle.type})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-red-400" />
                        <span>En Route</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1.5 w-max">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        On Trip
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gray-500" />
                        ~ 45 mins
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
  );
}
