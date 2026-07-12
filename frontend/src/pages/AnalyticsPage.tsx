import React, { useEffect, useState } from 'react';
import { fetchDashboardMetrics } from '../services/api';
import { Download, TrendingUp, Activity, DollarSign, Droplets } from 'lucide-react';

interface VehicleMetric {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  status: string;
  fuelEfficiency: number;
  operationalCost: number;
  roi: number;
  distance: number;
  revenue: number;
}

interface AggregateMetrics {
  fuelEfficiency: number;
  utilization: number;
  operationalCost: number;
  roi: number;
}

export default function AnalyticsPage() {
  const [aggregate, setAggregate] = useState<AggregateMetrics | null>(null);
  const [vehicles, setVehicles] = useState<VehicleMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics()
      .then((data) => {
        setAggregate(data.aggregate);
        setVehicles(data.vehicles);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading metrics:", error);
        setLoading(false);
      });
  }, []);

  const downloadCSV = () => {
    if (vehicles.length === 0) return;
    const headers = [
      "Plate Number",
      "Make",
      "Model",
      "Status",
      "Distance (km)",
      "Revenue ($)",
      "Fuel Efficiency (km/L)",
      "Operational Cost ($)",
      "ROI (%)"
    ];

    const rows = vehicles.map((v) => [
      v.plateNumber,
      v.make,
      v.model,
      v.status,
      v.distance.toFixed(2),
      v.revenue.toFixed(2),
      v.fuelEfficiency.toFixed(2),
      v.operationalCost.toFixed(2),
      v.roi.toFixed(2)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "vehicle_metrics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="text-white flex items-center justify-center h-full">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#131826] border border-[#1E2336] p-6 rounded-2xl shadow-sm hover:border-blue-500/30 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <Droplets className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Fuel Efficiency</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {aggregate?.fuelEfficiency.toFixed(2)} <span className="text-sm font-normal text-gray-500">km/L</span>
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-[#131826] border border-[#1E2336] p-6 rounded-2xl shadow-sm hover:border-emerald-500/30 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Fleet Utilization</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {aggregate?.utilization.toFixed(1)}<span className="text-lg">%</span>
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-[#131826] border border-[#1E2336] p-6 rounded-2xl shadow-sm hover:border-rose-500/30 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Operational Cost</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                <span className="text-lg">$</span>{aggregate?.operationalCost.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-[#131826] border border-[#1E2336] p-6 rounded-2xl shadow-sm hover:border-purple-500/30 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Vehicle ROI</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {aggregate?.roi.toFixed(2)}<span className="text-lg">%</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#131826] border border-[#1E2336] rounded-2xl overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-[#1E2336]">
          <h2 className="text-lg font-semibold text-white">Vehicle Metrics Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#0A0D14] text-gray-500 font-medium border-b border-[#1E2336]">
              <tr>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Distance (km)</th>
                <th className="px-6 py-4 text-right">Fuel Eff. (km/L)</th>
                <th className="px-6 py-4 text-right">Op. Cost</th>
                <th className="px-6 py-4 text-right">ROI (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2336]">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-[#1A2133] transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                      {v.make.charAt(0)}{v.model.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{v.plateNumber}</div>
                      <div className="text-xs text-gray-500">{v.make} {v.model}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      v.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-white">{v.distance.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-300">{v.fuelEfficiency.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-rose-300">${v.operationalCost.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-medium text-purple-400">{v.roi.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
