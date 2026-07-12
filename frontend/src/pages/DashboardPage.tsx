import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { SlidersHorizontal, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showRoleInfo, setShowRoleInfo] = useState(true);

  // Helper to format role names to display-friendly strings
  const formatRole = (roleStr: string) => {
    return roleStr
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const userRole = user?.role || "DRIVER";

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Welcome Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-gray-500 mt-1">Welcome back, {user?.name || "Guest User"}</p>
        </div>
      </div>

      {/* Active Role Notification banner */}
      {showRoleInfo && (
        <div className="bg-amber-600/10 border border-amber-500/25 text-amber-250 p-3.5 rounded-lg flex items-start justify-between text-xs animate-fadeIn">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">RBAC Active: Logged in as {formatRole(userRole)}</span>
              <span className="block leading-relaxed mt-0.5 text-gray-450">
                You have scope permissions for the sections assigned to your role. Try clicking on other sidebar items (like Drivers, Fleet, or Maintenance) to test RBAC lockout rules in action!
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowRoleInfo(false)} 
            className="text-slate-500 hover:text-slate-350 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dashboard Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111422]/50 p-4 rounded-xl border border-[#1E2336]">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-350">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          <span>FILTERS</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] text-gray-550 uppercase tracking-wider">Vehicle Types</span>
            <select className="bg-slate-950 border border-slate-850 text-[11px] text-slate-300 rounded px-2.5 py-1 focus:outline-none focus:border-slate-750">
              <option>Vehicle Types: All</option>
              <option>Trucks</option>
              <option>Vans</option>
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] text-gray-550 uppercase tracking-wider">Status</span>
            <select className="bg-slate-950 border border-slate-850 text-[11px] text-slate-300 rounded px-2.5 py-1 focus:outline-none focus:border-slate-750">
              <option>Status: All</option>
              <option>On Trip</option>
              <option>Completed</option>
              <option>Dispatched</option>
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] text-gray-550 uppercase tracking-wider">Region</span>
            <select className="bg-slate-950 border border-slate-850 text-[11px] text-slate-300 rounded px-2.5 py-1 focus:outline-none focus:border-slate-750">
              <option>Region: All</option>
              <option>North</option>
              <option>West</option>
              <option>East</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "ACTIVE VEHICLES", count: "53", color: "border-l-indigo-500" },
          { label: "AVAILABLE VEHICLES", count: "42", color: "border-l-emerald-500" },
          { label: "VEHICLES IN MAINTENANCE", count: "05", color: "border-l-amber-500" }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-[#0d101a] border border-[#1e2336] border-l-4 ${stat.color} p-5 rounded-xl flex flex-col justify-between h-28`}>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{stat.label}</span>
            <span className="text-4xl font-extrabold text-white tracking-tight">{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Recent Trips Table Card */}
      <div className="bg-[#0d101a] border border-[#1e2336] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2336] flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recent Trips</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-[10px] text-gray-500 uppercase tracking-wider border-b border-[#1e2336]">
                <th className="py-3 px-5 font-bold">Trip</th>
                <th className="py-3 px-5 font-bold">Vehicle</th>
                <th className="py-3 px-5 font-bold">Driver</th>
                <th className="py-3 px-5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 text-xs">
              {[
                { id: "TR001", vehicle: "VAN-05", driver: "Alex Mercer", status: "On Trip", statusColor: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" },
                { id: "TR002", vehicle: "TRK-01", driver: "John Doe", status: "Completed", statusColor: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
                { id: "TR003", vehicle: "AMV-03", driver: "Priya Patel", status: "Dispatched", statusColor: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
                { id: "TR004", vehicle: "--", driver: "--", status: "Draft", statusColor: "bg-slate-800/40 text-slate-400 border border-slate-800/60" }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-950/20">
                  <td className="py-3.5 px-5 font-semibold text-slate-300">{row.id}</td>
                  <td className="py-3.5 px-5 text-slate-450">{row.vehicle}</td>
                  <td className="py-3.5 px-5 text-slate-450">{row.driver}</td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
