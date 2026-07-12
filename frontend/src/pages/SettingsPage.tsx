import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Loader2, Check, Minus } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

type RoleName = "FLEET_MANAGER" | "DRIVER" | "SAFETY_OFFICER" | "FINANCIAL_ANALYST";
type RoleAccessMap = Record<string, string[]>;

export default function SettingsPage() {
  const { user } = useAuth();
  const isManager = user?.role === "FLEET_MANAGER";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState({
    depotName: "",
    currency: "",
    distanceUnit: "",
    rbac: {} as RoleAccessMap
  });
  
  const [initialForm, setInitialForm] = useState({
    depotName: "",
    currency: "",
    distanceUnit: "",
    rbac: {} as RoleAccessMap
  });

  const token = localStorage.getItem("token");
  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/settings`, { headers: authHeaders });
      const data = await res.json();
      if (data.success && data.data) {
        const fetchedData = {
          depotName: data.data.depotName || "",
          currency: data.data.currency || "INR (₹)",
          distanceUnit: data.data.distanceUnit || "Kilometers",
          rbac: (typeof data.data.rbac === 'string' ? JSON.parse(data.data.rbac) : data.data.rbac) || {}
        };
        setForm(fetchedData);
        setInitialForm(fetchedData);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "Settings saved successfully", type: "success" });
        setInitialForm(form); // Update initial form state on success
      } else {
        setMessage({ text: data.message || "Failed to save", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const handleRbacToggle = (role: RoleName, path: string) => {
    if (!isManager) return;
    setForm(prev => {
      const newRbac = { ...prev.rbac };
      if (!newRbac[path]) newRbac[path] = [];
      
      if (newRbac[path].includes(role)) {
        newRbac[path] = newRbac[path].filter(r => r !== role);
      } else {
        newRbac[path] = [...newRbac[path], role];
      }
      return { ...prev, rbac: newRbac };
    });
  };

  const hasAccess = (role: RoleName, path: string) => {
    return form.rbac[path]?.includes(role) || false;
  };

  const roles: { id: RoleName; label: string }[] = [
    { id: "FLEET_MANAGER", label: "Fleet Manager" },
    { id: "DRIVER", label: "Driver" },
    { id: "SAFETY_OFFICER", label: "Safety Officer" },
    { id: "FINANCIAL_ANALYST", label: "Financial Analyst" },
  ];

  const modules = [
    { id: "/vehicles", label: "Fleet" },
    { id: "/drivers", label: "Drivers" },
    { id: "/trips", label: "Trips" },
    { id: "/fuel-expenses", label: "Fuel/Exp." },
    { id: "/analytics", label: "Analytics" },
  ];

  return (
    <div className="space-y-6 font-sans pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Settings & RBAC</h1>
          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
            Manage global application configurations and view/edit role permissions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] xl:grid-cols-[350px_1fr] gap-8 lg:gap-12 items-start">
          
          {/* General Settings */}
          <div>
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">General</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">Depot Name</label>
                  <input
                    type="text"
                    value={form.depotName}
                    onChange={e => setForm({ ...form, depotName: e.target.value })}
                    disabled={!isManager}
                    className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">Currency</label>
                  <select
                    value={form.currency}
                    onChange={e => setForm({ ...form, currency: e.target.value })}
                    disabled={!isManager}
                    className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors appearance-none"
                  >
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">Distance Unit</label>
                  <select
                    value={form.distanceUnit}
                    onChange={e => setForm({ ...form, distanceUnit: e.target.value })}
                    disabled={!isManager}
                    className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-md px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors appearance-none"
                  >
                    <option value="Kilometers">Kilometers (km)</option>
                    <option value="Miles">Miles (mi)</option>
                  </select>
                </div>
              </div>

              {message && (
                <div className={`text-xs p-3 rounded-md border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={!isManager || submitting || !isDirty}
                className="mt-6 px-6 py-2.5 bg-[#5D87FF] hover:bg-[#4E75E5] disabled:bg-gray-700 disabled:text-gray-400 text-white text-xs font-semibold rounded-full transition-all shadow-lg shadow-[#5D87FF]/20 cursor-pointer w-full sm:w-auto"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save changes"}
              </button>
              
              {!isManager && (
                <p className="text-[10px] text-gray-500 mt-2">Only Fleet Managers can update settings and RBAC.</p>
              )}
            </form>
          </div>

          {/* RBAC Table */}
          <div className="w-full overflow-hidden">
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Role-Based Access (RBAC)</h2>
            <div className="bg-[#0A0C16]/50 border border-[#1E2336] rounded-xl overflow-hidden w-full">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#1E2336] text-[10px] text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-5 font-bold">Role</th>
                      {modules.map(m => (
                        <th key={m.id} className="py-4 px-3 font-bold text-center">{m.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2336] text-xs">
                    {roles.map(role => (
                      <tr key={role.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-5 text-gray-300 font-medium whitespace-nowrap">{role.label}</td>
                        {modules.map(m => (
                          <td key={m.id} className="py-4 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRbacToggle(role.id, m.id)}
                              disabled={!isManager}
                              className={`w-8 h-8 rounded-md flex items-center justify-center mx-auto transition-colors ${
                                hasAccess(role.id, m.id)
                                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                  : 'bg-[#1E2336]/50 text-gray-600 hover:bg-[#1E2336]'
                              } ${!isManager ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                            >
                              {hasAccess(role.id, m.id) ? <Check className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
              Note: Dashboard and Settings pages are accessible to all authenticated users. Changes to RBAC require a page reload to take full effect on the sidebar.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
