import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { getDrivers, type Driver } from '../services/driversApi';
import AddDriverModal from '../components/drivers/AddDriverModal';
import { useDebounce } from '../hooks/useDebounce';

type StatusFilter = Driver['status'] | 'ON_LEAVE' | 'ALL';

export default function DriversPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: getDrivers
  });

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return { label: '🟢 Available', color: 'bg-green-500/10 text-green-700 border-green-200' };
      case 'ON_TRIP': return { label: '🔵 On Trip', color: 'bg-blue-500/10 text-blue-700 border-blue-200' };
      case 'ON_LEAVE': return { label: '🟡 On Leave', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200' };
      case 'OFF_DUTY': return { label: '⚫ Off Duty', color: 'bg-gray-500/10 text-gray-700 border-gray-200' };
      case 'SUSPENDED': return { label: '🔴 Suspended', color: 'bg-red-500/10 text-red-700 border-red-200' };
      default: return { label: status, color: 'bg-gray-500/10 text-gray-700' };
    }
  };

  const getLicenseBadge = (dateString: string) => {
    const expiry = new Date(dateString);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: '🔴 Expired', color: 'bg-red-100 text-red-700 border-red-200' };
    if (diffDays <= 7) return { label: '🟡 Expires in 7 Days', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { label: '🟢 Valid', color: 'bg-green-100 text-green-700 border-green-200' };
  };

  const getSafetyBadge = (score: number) => {
    if (score >= 90) return { label: '🟢 Excellent', color: 'bg-green-100 text-green-700 border-green-200' };
    if (score >= 70) return { label: '🟡 Average', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { label: '🔴 Risk', color: 'bg-red-100 text-red-700 border-red-200' };
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
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-gray-900 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all placeholder-gray-400 shadow-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
        >
          <Plus size={18} strokeWidth={3} />
          Add Driver
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex-1 flex flex-col shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">License No.</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Safety</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading drivers...</td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No drivers found.</td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const license = getLicenseBadge(driver.licenseExpiry);
                  const safety = getSafetyBadge(driver.safetyScore);
                  const statusInfo = getStatusDisplay(driver.status);
                  
                  return (
                    <tr key={driver.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900">{driver.name}</td>
                      <td className="px-6 py-4 text-gray-600">{driver.licenseNumber}</td>
                      <td className="px-6 py-4 text-gray-600">{driver.licenseCategory}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-900 font-medium">{formatExpiryDate(driver.licenseExpiry)}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border w-max ${license.color}`}>
                            {license.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{driver.contactNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-900 font-medium">{driver.safetyScore}%</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border w-max ${safety.color}`}>
                            {safety.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-white border border-gray-200 shadow-sm rounded-xl p-4">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mr-2 w-full sm:w-auto mb-2 sm:mb-0">Toggle Stat:</span>
        {[
          { status: 'ALL', label: 'All', color: 'hover:bg-gray-100' },
          { status: 'AVAILABLE', label: '🟢 Available', color: 'bg-green-500 text-white' },
          { status: 'ON_TRIP', label: '🔵 On Trip', color: 'bg-blue-500 text-white' },
          { status: 'ON_LEAVE', label: '🟡 On Leave', color: 'bg-yellow-500 text-white' },
          { status: 'OFF_DUTY', label: '⚫ Off Duty', color: 'bg-gray-700 text-white' },
          { status: 'SUSPENDED', label: '🔴 Suspended', color: 'bg-red-500 text-white' }
        ].map((stat) => (
          <button
            key={stat.status}
            onClick={() => setStatusFilter(stat.status as StatusFilter)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === stat.status 
                ? (stat.status === 'ALL' ? 'bg-gray-800 text-white' : stat.color + ' shadow-md scale-105') 
                : 'bg-transparent text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {stat.label}
          </button>
        ))}
        
        <p className="w-full lg:w-auto lg:ml-auto mt-2 lg:mt-0 text-xs text-orange-400 font-medium text-center sm:text-left">
          Rule: Expired license or Suspended status → blocked from trip assignment
        </p>
      </div>

      <AddDriverModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
