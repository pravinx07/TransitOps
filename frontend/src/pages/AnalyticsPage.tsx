import { useMinimumLoading } from "../hooks/useMinimumLoading";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { fetchAnalytics } from "../services/api";


export default function AnalyticsPage() {
  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ['analyticsData'],
    queryFn: fetchAnalytics,
    refetchInterval: 30000
  });

  const showLoading = useMinimumLoading(isLoading, 800);

  const handleExportCSV = () => {
    if (!analytics) return;

    // Build CSV content
    const headers = ["Metric", "Value"];
    const rows = [
      ["Fuel Efficiency (km/l)", analytics.fuelEfficiency],
      ["Fleet Utilization (%)", analytics.fleetUtilization],
      ["Operational Cost", analytics.operationalCost],
      ["Vehicle ROI (%)", analytics.roi],
    ];

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.join(",") + "\n";
    });

    csvContent += "\nTop Costliest Vehicles\n";
    csvContent += "Reg No,Model,Total Cost\n";
    analytics.costliestVehicles.forEach((v: any) => {
      csvContent += `${v.regNo},${v.model},${v.totalCost}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "TransitOps_Analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (showLoading) {
    return (
      <div className="space-y-6 font-sans animate-pulse pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1E2336]">
          <div><div className="h-6 w-48 bg-[#1E2336] rounded mb-2"></div><div className="h-4 w-32 bg-[#1E2336] rounded"></div></div>
          <div className="h-8 w-24 bg-[#1E2336] rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[#0A0C16] border border-[#1E2336] rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-[#0A0C16] border border-[#1E2336] rounded-xl"></div>
          <div className="h-64 bg-[#0A0C16] border border-[#1E2336] rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="flex h-full items-center justify-center text-red-400 text-sm font-semibold">
        Failed to load analytics data.
      </div>
    );
  }

  // Find max expense for bar chart scaling, handle potential cached query schema differences
  const expensesArray = analytics.monthlyExpenses || analytics.monthlyRevenue || [];
  const maxExpense = Math.max(...(expensesArray.map((m: any) => m.cost || m.revenue || 0)), 10);

  // Find max cost for vehicle cost scaling
  const vehiclesArray = analytics.costliestVehicles || [];
  const maxCost = Math.max(...(vehiclesArray.map((v: any) => v.totalCost || 0)), 10);

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300 pb-10">
      
      {/* Standardized Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1E2336]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time performance insights and cost tracking</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Range: YTD</span>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-[#4F46E5]/20 text-[#818CF8] border border-[#4F46E5]/30 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider hover:bg-[#4F46E5]/30 transition ml-2"
          >
            <Download className="w-3 h-3" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fuel Efficiency */}
        <div className="bg-[#0A0C16]/50 border border-[#1E2336] p-5 rounded-xl border-t-2 border-t-[#059669] flex flex-col justify-between h-28">
          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Fuel Efficiency</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-extrabold text-white">{analytics.fuelEfficiency}</span>
            <span className="text-xs text-gray-400 font-medium">km/l</span>
          </div>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-[#0A0C16]/50 border border-[#1E2336] p-5 rounded-xl flex flex-col justify-between h-28">
          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Fleet Utilization</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-extrabold text-white">{analytics.fleetUtilization}%</span>
          </div>
        </div>

        {/* Operational Cost */}
        <div className="bg-[#0A0C16]/50 border border-[#1E2336] p-5 rounded-xl border-l-2 border-l-[#F97316] flex flex-col justify-between h-28">
          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Operational Cost</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-extrabold text-white">{analytics.operationalCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Vehicle ROI */}
        <div className="bg-[#0A0C16]/50 border border-[#1E2336] p-5 rounded-xl border-l-2 border-l-[#10B981] flex flex-col justify-between h-28">
          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Vehicle ROI</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-extrabold text-white">{analytics.roi}%</span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-gray-500 font-mono">
        ROI = [Revenue - (Maintenance + Fuel)] / Acquisition Cost
      </div>

      {/* Bottom Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        
        {/* Monthly Expenses Bar Chart */}
        <div className="bg-[#0A0C16]/50 border border-[#1E2336] rounded-xl p-5">
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Monthly Expenses</h2>
          <div className="flex items-end space-x-4 h-40">
            {expensesArray.map((item: any, idx: number) => {
              const cost = item.cost ?? item.revenue ?? 0;
              const heightPct = Math.max(2, (cost / maxExpense) * 100);
              return (
                <div key={idx} className="flex flex-col justify-end items-center flex-1 group h-full">
                  <div className="w-full bg-[#3B82F6] opacity-80 group-hover:opacity-100 transition-all rounded-t relative" style={{ height: `${heightPct}%` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1E2336] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {cost.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-2">{item.month}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Costliest Vehicles */}
        <div className="bg-[#0A0C16]/50 border border-[#1E2336] rounded-xl p-5">
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Top Costliest Vehicles</h2>
          <div className="space-y-6">
            {vehiclesArray.length > 0 ? (
              vehiclesArray.map((v: any, idx: number) => {
                const widthPct = Math.max(5, (v.totalCost / maxCost) * 100);
                const colors = ['bg-[#F43F5E]', 'bg-[#F97316]', 'bg-[#3B82F6]'];
                const color = colors[idx] || 'bg-gray-500';
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-300 font-medium">{v.regNo} <span className="text-gray-500 text-[10px]">({v.model})</span></span>
                      <span className="text-gray-400 font-mono">{v.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#1E2336] h-2 rounded-full overflow-hidden">
                      <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${widthPct}%` }}></div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-xs text-gray-500 text-center py-10">No cost data available</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
