import { useMinimumLoading } from "../hooks/useMinimumLoading";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Edit } from 'lucide-react';
import { getDrivers, type Driver } from '../services/driversApi';
import DriverModal from '../components/drivers/DriverModal';
import { useDebounce } from '../hooks/useDebounce';


type StatusFilter = Driver['status'] | 'ON_LEAVE' | 'ALL';

export default function DriversPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: getDrivers
  });
  const showLoading = useMinimumLoading(isLoading, 800);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return { label: '🟢 Available', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'ON_TRIP': return { label: '🔵 On Trip', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'ON_LEAVE': return { label: '🟡 On Leave', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'OFF_DUTY': return { label: '⚫ Off Duty', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
      case 'SUSPENDED': return { label: '🔴 Suspended', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      default: return { label: status, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
  };

  const getLicenseBadge = (dateString: string) => {
    const expiry = new Date(dateString);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: '🔴 Expired', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (diffDays <= 7) return { label: '🟡 Expires in 7 Days', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return { label: '🟢 Valid', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
  };

  const getSafetyBadge = (score: number) => {
    if (score >= 90) return { label: '🟢 Excellent', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    if (score >= 70) return { label: '🟡 Average', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return { label: '🔴 Risk', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  const formatExpiryDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const filteredDrivers = drivers?.filter(d => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesSearch = d.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
                          d.licenseNumber.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  return (
    <div className="h-full flex flex-col space-y-6 font-sans animate-in fade-in duration-300 pb-10">
      
      {/* Standardized Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1E2336]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Driver Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage and track your fleet drivers</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text"
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#5D87FF] transition-all placeholder-gray-500"
            />
          </div>
          <button 
            onClick={() => {
              setSelectedDriver(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
          >
            <Plus size={16} strokeWidth={3} />
            Add Driver
          </button>
        </div>
      </div>

      <div className="bg-[#0A0C16]/50 border border-[#1E2336] rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#1E2336] text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-[#111422]">
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">License No.</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Safety</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2336] text-xs">
              {showLoading ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-[#1E2336] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-[#1E2336] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 bg-[#1E2336] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-[#1E2336] rounded mb-1"></div><div className="h-3 w-12 bg-[#1E2336] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-[#1E2336] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-10 bg-[#1E2336] rounded mb-1"></div><div className="h-3 w-16 bg-[#1E2336] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-20 bg-[#1E2336] rounded-full"></div></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No drivers found.</td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const license = getLicenseBadge(driver.licenseExpiry);
                  const safety = getSafetyBadge(driver.safetyScore);
                  const statusInfo = getStatusDisplay(driver.status);
                  
                  return (
                    <tr key={driver.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-300">{driver.name}</td>
                      <td className="px-6 py-4 text-gray-400 font-mono">{driver.licenseNumber}</td>
                      <td className="px-6 py-4 text-gray-400">{driver.licenseCategory}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-300 font-medium">{formatExpiryDate(driver.licenseExpiry)}</span>
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border w-max ${license.color}`}>
                            {license.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{driver.contactNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-300 font-medium">{driver.safetyScore}%</span>
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border w-max ${safety.color}`}>
                            {safety.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            setSelectedDriver(driver);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-[#1E2336] rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-[#0A0C16]/50 border border-[#1E2336] rounded-xl p-4">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-2 w-full sm:w-auto mb-2 sm:mb-0">Toggle Stat:</span>
        {[
          { status: 'ALL', label: 'All', color: 'bg-[#1E2336] text-white' },
          { status: 'AVAILABLE', label: '🟢 Available', color: 'bg-green-500/20 text-green-400' },
          { status: 'ON_TRIP', label: '🔵 On Trip', color: 'bg-blue-500/20 text-blue-400' },
          { status: 'ON_LEAVE', label: '🟡 On Leave', color: 'bg-yellow-500/20 text-yellow-400' },
          { status: 'OFF_DUTY', label: '⚫ Off Duty', color: 'bg-gray-500/20 text-gray-400' },
          { status: 'SUSPENDED', label: '🔴 Suspended', color: 'bg-red-500/20 text-red-400' }
        ].map((stat) => (
          <button
            key={stat.status}
            onClick={() => setStatusFilter(stat.status as StatusFilter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === stat.status 
                ? (stat.color + ' border border-transparent') 
                : 'bg-transparent text-gray-500 border border-[#1E2336] hover:bg-[#1E2336]/50'
            }`}
          >
            {stat.label}
          </button>
        ))}
        
        <p className="w-full lg:w-auto lg:ml-auto mt-2 lg:mt-0 text-[10px] text-orange-400/80 font-mono text-center sm:text-left">
          Rule: Expired license or Suspended status → blocked from trip assignment
        </p>
      </div>

      <DriverModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDriver(null);
        }}
        driver={selectedDriver}
      />
    </div>
  );
}
