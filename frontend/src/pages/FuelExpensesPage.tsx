import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2 } from 'lucide-react';
import { getFuelLogs, getExpenses, getOperationalCost, addFuelLog, addExpense } from '../services/financeApi';
import { getVehicles } from '../services/vehiclesApi';
import { useDebounce } from '../hooks/useDebounce';

export default function FuelExpensesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Modals state
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Form states
  const [fuelForm, setFuelForm] = useState({ vehicleId: '', date: '', liters: '', fuelCost: '' });
  const [expenseForm, setExpenseForm] = useState({ tripRef: '', vehicleId: '', date: '', toll: '', other: '', maintenance: '', status: 'PENDING' });

  const isFuelFormValid = fuelForm.vehicleId && fuelForm.date && fuelForm.liters && fuelForm.fuelCost;
  const isExpenseFormValid = expenseForm.tripRef && expenseForm.vehicleId && expenseForm.date;

  // Queries
  const { data: fuelLogs, isLoading: isLoadingFuel } = useQuery({ queryKey: ['fuelLogs'], queryFn: getFuelLogs });
  const { data: expenses, isLoading: isLoadingExpenses } = useQuery({ queryKey: ['expenses'], queryFn: getExpenses });
  const { data: opCost } = useQuery({ queryKey: ['opCost'], queryFn: getOperationalCost });
  const { data: vehicles } = useQuery({ queryKey: ['vehicles'], queryFn: getVehicles });

  // Filtering
  const filteredFuelLogs = fuelLogs?.filter(l => l.vehicle?.regNo.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) || [];
  const filteredExpenses = expenses?.filter(e => e.vehicle?.regNo.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || e.tripRef.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) || [];

  // Mutations
  const addFuelMutation = useMutation({
    mutationFn: addFuelLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelLogs'] });
      queryClient.invalidateQueries({ queryKey: ['opCost'] });
      setIsFuelModalOpen(false);
      setFuelForm({ vehicleId: '', date: '', liters: '', fuelCost: '' });
    }
  });

  const addExpenseMutation = useMutation({
    mutationFn: addExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['opCost'] });
      setIsExpenseModalOpen(false);
      setExpenseForm({ tripRef: '', vehicleId: '', date: '', toll: '', other: '', maintenance: '', status: 'PENDING' });
    }
  });

  // Simple modal forms
  const handleAddFuel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addFuelMutation.mutate({
      vehicleId: fuelForm.vehicleId,
      date: fuelForm.date,
      liters: Number(fuelForm.liters),
      fuelCost: Number(fuelForm.fuelCost)
    });
  };

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addExpenseMutation.mutate({
      tripRef: expenseForm.tripRef,
      vehicleId: expenseForm.vehicleId,
      date: expenseForm.date,
      toll: Number(expenseForm.toll || 0),
      other: Number(expenseForm.other || 0),
      maintenance: Number(expenseForm.maintenance || 0),
      status: expenseForm.status as any
    });
  };

  const closeFuelModal = () => {
    setIsFuelModalOpen(false);
    setFuelForm({ vehicleId: '', date: '', liters: '', fuelCost: '' });
  };

  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setExpenseForm({ tripRef: '', vehicleId: '', date: '', toll: '', other: '', maintenance: '', status: 'PENDING' });
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300 font-sans pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search by vehicle or trip..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#5D87FF] transition-colors"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsFuelModalOpen(true)}
            className="flex-1 sm:flex-none bg-[#D97706] hover:bg-[#B45309] text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D97706]/20 cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} /> Log Fuel
          </button>
          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex-1 sm:flex-none bg-[#059669] hover:bg-[#047857] text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#059669]/20 cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} /> Add Expense
          </button>
        </div>
      </div>

      {/* Fuel Logs Section */}
      <div>
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Fuel Logs</h2>
        <div className="bg-[#0A0C16]/50 border border-[#1E2336] rounded-xl overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-[#1E2336] text-[10px] text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-5 font-bold">Vehicle</th>
                  <th className="py-4 px-5 font-bold">Date</th>
                  <th className="py-4 px-5 font-bold">Liters</th>
                  <th className="py-4 px-5 font-bold text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2336] text-xs">
                {isLoadingFuel ? (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-500">Loading...</td></tr>
                ) : filteredFuelLogs.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-500">No fuel logs found.</td></tr>
                ) : (
                  filteredFuelLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 text-gray-300 font-medium">{log.vehicle?.regNo || 'Unknown'}</td>
                      <td className="py-4 px-5 text-gray-400">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="py-4 px-5 text-gray-400">{log.liters.toFixed(1)} L</td>
                      <td className="py-4 px-5 text-gray-300 font-medium text-right">{log.fuelCost.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Other Expenses Section */}
      <div>
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Other Expenses (Toll / Misc)</h2>
        <div className="bg-[#0A0C16]/50 border border-[#1E2336] rounded-xl overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-[#1E2336] text-[10px] text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-5 font-bold">Trip</th>
                  <th className="py-4 px-5 font-bold">Vehicle</th>
                  <th className="py-4 px-5 font-bold text-right">Toll</th>
                  <th className="py-4 px-5 font-bold text-right">Other</th>
                  <th className="py-4 px-5 font-bold text-right">Maint. (Added)</th>
                  <th className="py-4 px-5 font-bold text-right">Total</th>
                  <th className="py-4 px-5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2336] text-xs">
                {isLoadingExpenses ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-500">Loading...</td></tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-500">No expenses found.</td></tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 text-gray-300 font-medium">{exp.tripRef}</td>
                      <td className="py-4 px-5 text-gray-400">{exp.vehicle?.regNo || 'Unknown'}</td>
                      <td className="py-4 px-5 text-gray-400 text-right">{exp.toll.toLocaleString()}</td>
                      <td className="py-4 px-5 text-gray-400 text-right">{exp.other.toLocaleString()}</td>
                      <td className="py-4 px-5 text-gray-400 text-right">{exp.maintenance.toLocaleString()}</td>
                      <td className="py-4 px-5 text-emerald-400 font-medium text-right">{(exp.toll + exp.other + exp.maintenance).toLocaleString()}</td>
                      <td className="py-4 px-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold border ${
                          exp.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {exp.status === 'COMPLETED' ? 'Completed' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Operational Cost Summary */}
      <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[#1E2336]">
        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          Total Operational Cost (Auto) = Fuel + Maint
        </div>
        <div className="text-xl sm:text-2xl font-bold text-[#D97706]">
          {opCost?.totalCost.toLocaleString() || '0'}
        </div>
      </div>

      {/* Fuel Modal */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#131826] border border-[#1E2336] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-4">Log Fuel</h2>
            <form onSubmit={handleAddFuel} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                  Vehicle <span className="text-red-500">*</span>
                </label>
                <select 
                  name="vehicleId" 
                  value={fuelForm.vehicleId}
                  onChange={(e) => setFuelForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                  required 
                  className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5D87FF]"
                >
                  <option value="">Select a vehicle...</option>
                  {vehicles?.map(v => <option key={v.id} value={v.id}>{v.regNo} ({v.model})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  name="date" 
                  value={fuelForm.date}
                  onChange={(e) => setFuelForm(prev => ({ ...prev, date: e.target.value }))}
                  required 
                  className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5D87FF] [color-scheme:dark]" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                    Liters <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    name="liters" 
                    value={fuelForm.liters}
                    onChange={(e) => setFuelForm(prev => ({ ...prev, liters: e.target.value }))}
                    required 
                    className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5D87FF]" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                    Total Cost <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    name="fuelCost" 
                    value={fuelForm.fuelCost}
                    onChange={(e) => setFuelForm(prev => ({ ...prev, fuelCost: e.target.value }))}
                    required 
                    className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5D87FF]" 
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeFuelModal} className="flex-1 bg-transparent border border-[#1E2336] hover:bg-[#1E2336] text-white py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={!isFuelFormValid || addFuelMutation.isPending} className="flex-1 bg-[#5D87FF] hover:bg-[#4E75E5] disabled:bg-gray-700 disabled:text-gray-400 text-white py-2 rounded-md text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer">
                  {addFuelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#131826] border border-[#1E2336] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-4">Add Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                    Trip Ref <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="tripRef" 
                    value={expenseForm.tripRef}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, tripRef: e.target.value }))}
                    required 
                    placeholder="e.g. TR-001" 
                    className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5D87FF]" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                    Vehicle <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="vehicleId" 
                    value={expenseForm.vehicleId}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                    required 
                    className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5D87FF]"
                  >
                    <option value="">Select vehicle...</option>
                    {vehicles?.map(v => <option key={v.id} value={v.id}>{v.regNo}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  name="date" 
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                  required 
                  className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5D87FF] [color-scheme:dark]" 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">Toll</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    name="toll" 
                    value={expenseForm.toll}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, toll: e.target.value }))}
                    className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5D87FF]" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">Other</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    name="other" 
                    value={expenseForm.other}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, other: e.target.value }))}
                    className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5D87FF]" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">Maint.</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    name="maintenance" 
                    value={expenseForm.maintenance}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, maintenance: e.target.value }))}
                    className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5D87FF]" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select 
                  name="status" 
                  value={expenseForm.status}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, status: e.target.value }))}
                  required
                  className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5D87FF]"
                >
                  <option value="PENDING">Pending</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeExpenseModal} className="flex-1 bg-transparent border border-[#1E2336] hover:bg-[#1E2336] text-white py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={!isExpenseFormValid || addExpenseMutation.isPending} className="flex-1 bg-[#5D87FF] hover:bg-[#4E75E5] disabled:bg-gray-700 disabled:text-gray-400 text-white py-2 rounded-md text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer">
                  {addExpenseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
