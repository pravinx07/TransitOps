import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { SlidersHorizontal, ShieldCheck, Loader2 } from "lucide-react";
import { fetchDashboardMetrics } from "../services/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showRoleInfo, setShowRoleInfo] = useState(true);
  const [filters, setFilters] = useState({ type: 'All', status: 'All', region: 'All' });

  // Fetch real data
  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ['dashboardMetrics', filters],
    queryFn: () => fetchDashboardMetrics(filters),
    refetchInterval: 30000, // refetch every 30s
    placeholderData: (prev: any) => prev // Prevent hard refresh on filter change
  });

  // Helper to format role names
  const formatRole = (roleStr: string) => {
    return roleStr
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const userRole = user?.role || "DRIVER";

  if (isLoading) {
    return (
      <div className="space-y-6 font-sans animate-pulse pb-10">
        <div className="flex justify-between">
          <div><div className="h-6 w-48 bg-[#1E2336] rounded mb-2"></div><div className="h-4 w-32 bg-[#1E2336] rounded"></div></div>
          <div className="h-8 w-24 bg-[#1E2336] rounded-full"></div>
        </div>
        <div className="h-12 w-full bg-[#111422] rounded-xl border border-[#1E2336]"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => <div key={i} className="h-24 bg-[#0A0C16] border border-[#1E2336] rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-[#0A0C16] border border-[#1E2336] rounded-xl"></div>
          <div className="h-64 bg-[#0A0C16] border border-[#1E2336] rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="flex h-full items-center justify-center text-red-400">
        Failed to load dashboard data.
      </div>
    );
  }

  const { vehicleStatusDistribution } = metrics;
  const totalVehicles = metrics.activeVehicles || 1; // avoid division by zero

  const availablePct = (vehicleStatusDistribution.available / totalVehicles) * 100;
  const onTripPct = (vehicleStatusDistribution.onTrip / totalVehicles) * 100;
  const inShopPct = (vehicleStatusDistribution.inShop / totalVehicles) * 100;
  const retiredPct = (vehicleStatusDistribution.retired / totalVehicles) * 100;

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300 pb-10">
      
      {/* Top Welcome Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-gray-500 mt-1">Welcome back, {user?.name || "Guest User"}</p>
        </div>
      </div>

      {/* Dashboard Filters Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#1E2336]">
        <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-500 tracking-wider">
          <SlidersHorizontal className="h-3 w-3" />
          <span>FILTERS</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Vehicle Types</span>
            <select 
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="bg-[#0A0C16] border border-[#1E2336] text-[10px] text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-[#5D87FF]"
            >
              <option value="All">All</option>
              <option value="Truck">Trucks</option>
              <option value="Van">Vans</option>
              <option value="Bus">Buses</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Status</span>
            <select 
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="bg-[#0A0C16] border border-[#1E2336] text-[10px] text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-[#5D87FF]"
            >
              <option value="All">All</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="IN_SHOP">In Shop</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Region</span>
            <select 
              value={filters.region}
              onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
              className="bg-[#0A0C16] border border-[#1E2336] text-[10px] text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-[#5D87FF]"
            >
              <option value="All">All</option>
              <option value="North">North</option>
              <option value="West">West</option>
              <option value="East">East</option>
              <option value="South">South</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: "ACTIVE VEHICLES", count: metrics.activeVehicles.toString().padStart(2, '0'), color: "border-l-[#5D87FF]" },
          { label: "AVAILABLE VEHICLES", count: metrics.availableVehicles.toString().padStart(2, '0'), color: "border-l-[#059669]" },
          { label: "VEHICLES IN MAINTENANCE", count: metrics.vehiclesInMaintenance.toString().padStart(2, '0'), color: "border-l-[#D97706]" },
          { label: "ACTIVE TRIPS", count: metrics.activeTrips.toString().padStart(2, '0'), color: "border-l-[#3B82F6]" },
          { label: "PENDING TRIPS", count: metrics.pendingTrips.toString().padStart(2, '0'), color: "border-l-gray-500" },
          { label: "DRIVERS ON DUTY", count: metrics.driversOnDuty.toString().padStart(2, '0'), color: "border-l-[#8B5CF6]" },
          { label: "FLEET UTILIZATION", count: `${metrics.fleetUtilization}%`, color: "border-l-[#10B981]" }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-[#0A0C16]/50 border border-[#1E2336] border-l-4 ${stat.color} p-4 rounded-xl flex flex-col justify-between h-24`}>
            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold truncate">{stat.label}</span>
            <span className="text-2xl font-extrabold text-white tracking-tight">{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Trips Table */}
        <div className="lg:col-span-2 bg-[#0A0C16]/50 border border-[#1E2336] rounded-xl p-5 overflow-hidden">
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Recent Trips</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="border-b border-[#1E2336] text-[10px] text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-bold">Trip</th>
                  <th className="pb-3 px-4 font-bold">Vehicle</th>
                  <th className="pb-3 px-4 font-bold">Driver</th>
                  <th className="pb-3 px-4 font-bold">Status</th>
                  <th className="pb-3 pl-4 font-bold text-right">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2336] text-xs">
                {metrics.recentTrips?.length > 0 ? (
                  metrics.recentTrips.map((trip: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 text-gray-300 font-medium">{trip.tripRef}</td>
                      <td className="py-3 px-4 text-gray-400">{trip.vehicle}</td>
                      <td className="py-3 px-4 text-gray-400">{trip.driver}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${
                          trip.status === 'On Trip' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          trip.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          trip.status === 'Dispatched' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-right text-gray-400 font-mono">{trip.eta}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500 text-xs">No active trips available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Progress Bars */}
        <div className="bg-[#0A0C16]/50 border border-[#1E2336] rounded-xl p-5">
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Vehicle Status</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">Available</span>
                <span className="text-gray-400">{vehicleStatusDistribution.available}</span>
              </div>
              <div className="w-full bg-[#1E2336] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#059669] h-1.5 rounded-full" style={{ width: `${availablePct}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">On Trip</span>
                <span className="text-gray-400">{vehicleStatusDistribution.onTrip}</span>
              </div>
              <div className="w-full bg-[#1E2336] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#3B82F6] h-1.5 rounded-full" style={{ width: `${onTripPct}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">In Shop</span>
                <span className="text-gray-400">{vehicleStatusDistribution.inShop}</span>
              </div>
              <div className="w-full bg-[#1E2336] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#D97706] h-1.5 rounded-full" style={{ width: `${inShopPct}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">Retired</span>
                <span className="text-gray-400">{vehicleStatusDistribution.retired}</span>
              </div>
              <div className="w-full bg-[#1E2336] rounded-full h-1.5 overflow-hidden">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${retiredPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
