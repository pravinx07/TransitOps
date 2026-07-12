import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Plus, Search, Pencil, Trash2, X, Loader2, AlertCircle, ChevronDown } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";

interface Vehicle {
  id: string;
  regNo: string;
  model: string;
  type: string;
  capacity: string;
  odometer: number;
  avgCost: number;
  status: VehicleStatus;
}

const STATUS_STYLES: Record<VehicleStatus, string> = {
  AVAILABLE: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  ON_TRIP:   "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
  IN_SHOP:   "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  RETIRED:   "bg-red-500/15 text-red-400 border border-red-500/30",
};

const STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: "Available",
  ON_TRIP:   "On Trip",
  IN_SHOP:   "In Shop",
  RETIRED:   "Retired",
};

const VEHICLE_TYPES = ["Van", "Truck", "Mini", "Bus", "SUV"];
const EMPTY_FORM = { regNo: "", model: "", type: "Van", capacity: "", odometer: "", avgCost: "", status: "AVAILABLE" as VehicleStatus };

export default function VehiclesPage() {
  const { user } = useAuth();
  const isManager = user?.role === "FLEET_MANAGER";

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");
  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`${API}/vehicles?${params}`, { headers: authHeaders });
      const data = await res.json();
      setVehicles(data.success ? data.data : []);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, search]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditTarget(v);
    setForm({ regNo: v.regNo, model: v.model, type: v.type, capacity: v.capacity, odometer: String(v.odometer), avgCost: String(v.avgCost), status: v.status });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    const body = { ...form, odometer: Number(form.odometer), avgCost: Number(form.avgCost) };
    const url = editTarget ? `${API}/vehicles/${editTarget.id}` : `${API}/vehicles`;
    const method = editTarget ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) {
        if (typeof data.error === "object") setFormErrors(data.error);
        else setFormErrors({ general: data.message });
      } else {
        setShowModal(false);
        fetchVehicles();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vehicle?")) return;
    await fetch(`${API}/vehicles/${id}`, { method: "DELETE", headers: authHeaders });
    fetchVehicles();
  };

  return (
    <div className="space-y-5 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Vehicle Registry</h1>
          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
            Reg. No. must be unique · Retired/In Shop vehicles hidden from Trip Dispatcher
          </p>
        </div>
        {isManager && (
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-600/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Vehicle</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 bg-[#111422]/50 p-3 sm:p-4 rounded-xl border border-[#1E2336]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search reg. no. or model..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-[#0A0C16] border border-[#1E2336] rounded-md text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full appearance-none bg-[#0A0C16] border border-[#1E2336] text-xs text-gray-300 rounded-md pl-3 pr-7 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Type: All</option>
              {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-[#0A0C16] border border-[#1E2336] text-xs text-gray-300 rounded-md pl-3 pr-7 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Status: All</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Desktop Table — hidden on mobile */}
      <div className="hidden md:block bg-[#0d101a] border border-[#1e2336] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1e2336] text-[10px] text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Reg. No.</th>
                <th className="py-3 px-4 font-bold">Model/Name</th>
                <th className="py-3 px-4 font-bold">Type</th>
                <th className="py-3 px-4 font-bold">Capacity</th>
                <th className="py-3 px-4 font-bold">Odometer</th>
                <th className="py-3 px-4 font-bold">Avg. Cost</th>
                <th className="py-3 px-4 font-bold">Status</th>
                {isManager && <th className="py-3 px-4 font-bold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2336] text-xs">
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading vehicles...
                </td></tr>
              ) : vehicles.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-gray-500">No vehicles found</td></tr>
              ) : vehicles.map(v => (
                <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-300">{v.regNo}</td>
                  <td className="py-3 px-4 text-white font-medium">{v.model}</td>
                  <td className="py-3 px-4 text-gray-400">{v.type}</td>
                  <td className="py-3 px-4 text-gray-400">{v.capacity}</td>
                  <td className="py-3 px-4 text-gray-400">{v.odometer.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-400">₹{v.avgCost.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[v.status]}`}>
                      {STATUS_LABELS[v.status]}
                    </span>
                  </td>
                  {isManager && (
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(v)} className="p-1.5 rounded hover:bg-indigo-500/10 text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#1e2336] text-[10px] text-gray-600">
          {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} total
        </div>
      </div>

      {/* Mobile Cards — visible only on small screens */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-16 text-center text-gray-500 bg-[#0d101a] border border-[#1e2336] rounded-xl">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-[#0d101a] border border-[#1e2336] rounded-xl text-xs">
            No vehicles found
          </div>
        ) : vehicles.map(v => (
          <div key={v.id} className="bg-[#0d101a] border border-[#1e2336] rounded-xl p-4 space-y-3">
            {/* Card Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono font-bold text-white text-sm">{v.regNo}</p>
                <p className="text-xs text-gray-400 mt-0.5">{v.model} · {v.type}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[v.status]}`}>
                  {STATUS_LABELS[v.status]}
                </span>
              </div>
            </div>
            {/* Card Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1e2336]">
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">Capacity</p>
                <p className="text-xs text-gray-300 font-medium mt-0.5">{v.capacity}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">Odometer</p>
                <p className="text-xs text-gray-300 font-medium mt-0.5">{v.odometer.toLocaleString()} km</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">Avg. Cost</p>
                <p className="text-xs text-gray-300 font-medium mt-0.5">₹{v.avgCost.toLocaleString()}</p>
              </div>
            </div>
            {/* Card Actions */}
            {isManager && (
              <div className="flex gap-2 pt-2 border-t border-[#1e2336]">
                <button
                  onClick={() => openEdit(v)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
        <p className="text-[10px] text-gray-600 text-center">{vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} total</p>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-[#0d101a] border border-[#1e2336] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#1e2336]">
              <h2 className="text-base font-bold text-white">{editTarget ? "Edit Vehicle" : "Add New Vehicle"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white cursor-pointer p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              {formErrors.general && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />{formErrors.general}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Reg. No." error={formErrors.regNo}>
                  <input value={form.regNo} onChange={e => setForm(f => ({ ...f, regNo: e.target.value }))} placeholder="GJ01AB1234" className={inputCls(!!formErrors.regNo)} />
                </Field>
                <Field label="Model / Name" error={formErrors.model}>
                  <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="VAN-05" className={inputCls(!!formErrors.model)} />
                </Field>
                <Field label="Type" error={formErrors.type}>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputCls(!!formErrors.type)}>
                    {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Capacity" error={formErrors.capacity}>
                  <input value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="500 kg" className={inputCls(!!formErrors.capacity)} />
                </Field>
                <Field label="Odometer (km)" error={formErrors.odometer}>
                  <input type="number" value={form.odometer} onChange={e => setForm(f => ({ ...f, odometer: e.target.value }))} placeholder="74000" className={inputCls(!!formErrors.odometer)} />
                </Field>
                <Field label="Avg. Cost (₹)" error={formErrors.avgCost}>
                  <input type="number" value={form.avgCost} onChange={e => setForm(f => ({ ...f, avgCost: e.target.value }))} placeholder="620000" className={inputCls(!!formErrors.avgCost)} />
                </Field>
                <Field label="Status" error={formErrors.status} className="col-span-1 sm:col-span-2">
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as VehicleStatus }))} className={inputCls(!!formErrors.status)}>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </Field>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-[#1e2336] text-gray-400 hover:text-white text-sm font-semibold rounded-lg transition-all cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editTarget ? "Save Changes" : "Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full bg-[#0A0C16] border ${hasError ? "border-red-500/50" : "border-[#1E2336]"} rounded-md px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors`;
}

function Field({ label, error, children, className = "" }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
