import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/auth";
import { useNavigate } from "react-router-dom";
import { Truck, AlertCircle, Key, Mail, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("FLEET_MANAGER");
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await login(email, password, role);
    setIsSubmitting(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      if (result.errors) {
        setErrors(result.errors);
      }
      setGeneralError(result.message || "Failed to sign in. Please verify your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0b0f19]">
      
      {/* Left panel - Branding and Roles Info (Light style matching wireframe split) */}
      <div className="w-full md:w-[42%] bg-slate-100 text-slate-900 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Glow detail */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center space-x-2.5 mb-16">
            <div className="p-2 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">TransitOps</span>
              <span className="text-[10px] text-slate-500 font-medium block">Smart Transport Operations Platform</span>
            </div>
          </div>

          <div className="space-y-6 max-w-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              One login, four roles:
            </h2>
            <ul className="space-y-4">
              {[
                { name: "Fleet Manager", desc: "Monitors asset statuses and workshop entries." },
                { name: "Dispatcher", desc: "Schedules route assignments and dispatches." },
                { name: "Safety Officer", desc: "Audits driving licenses and compliance." },
                { name: "Financial Analyst", desc: "Tracks expense reports and asset ROI." }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3 group">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">{item.name}</span>
                    <span className="text-xs text-slate-500 block leading-tight">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 mt-12 md:mt-0 text-[10px] text-slate-400 font-medium">
          TRANSITOPS &copy; 2026. ROLE-BASED ACCESS CONTROL
        </div>
      </div>

      {/* Right panel - Form (Dark style matching wireframe split) */}
      <div className="w-full md:w-[58%] bg-[#0e1322] border-t md:border-t-0 md:border-l border-slate-900 p-8 md:p-12 flex items-center justify-center relative">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 z-10">
          
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Sign in to your account</h1>
            <p className="text-xs text-slate-400">Enter your credentials to continue</p>
          </div>

          {/* General Alert Box / Lockout banner */}
          {generalError && (
            <div className="bg-red-500/10 border border-red-500/35 text-red-200 p-3.5 rounded-lg flex items-start space-x-2.5 text-xs animate-shake">
              <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Sign In Failed</span>
                <span className="block leading-relaxed mt-0.5">{generalError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-350 block uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@transitops.com"
                  className={`w-full bg-slate-950 border ${
                    errors.email ? "border-red-500/80 focus:ring-red-500/30" : "border-slate-800 focus:ring-indigo-500/30"
                  } rounded-lg py-2.5 pl-10 pr-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all`}
                />
              </div>
              {errors.email && (
                <div className="flex items-center space-x-1 text-red-400 text-[11px] mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-350 block uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-500" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-slate-950 border ${
                    errors.password ? "border-red-500/80 focus:ring-red-500/30" : "border-slate-800 focus:ring-indigo-500/30"
                  } rounded-lg py-2.5 pl-10 pr-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all`}
                />
              </div>
              {errors.password && (
                <div className="flex items-center space-x-1 text-red-400 text-[11px] mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Role Select Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-350 block uppercase tracking-wider">Role Select</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className={`w-full bg-slate-950 border ${
                  errors.role ? "border-red-500/80 focus:ring-red-500/30" : "border-slate-800 focus:ring-indigo-500/30"
                } rounded-lg py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-2 transition-all`}
              >
                <option value="FLEET_MANAGER">Fleet Manager</option>
                <option value="DRIVER">Dispatcher / Driver</option>
                <option value="SAFETY_OFFICER">Safety Officer</option>
                <option value="FINANCIAL_ANALYST">Financial Analyst</option>
              </select>
              {errors.role && (
                <div className="flex items-center space-x-1 text-red-400 text-[11px] mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.role}</span>
                </div>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-400 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-850 bg-slate-950 text-amber-600 focus:ring-amber-500/20"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-amber-550 hover:text-amber-400 font-semibold transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-600 hover:bg-amber-550 disabled:bg-amber-800 disabled:opacity-60 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-600/10 active:scale-[0.98] cursor-pointer"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Access scoped lists under the login form */}
          <div className="pt-6 border-t border-slate-900/60 text-[11px] text-slate-400 space-y-2">
            <span className="font-bold text-slate-350 block">Access is scoped by role after login:</span>
            <ul className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
              <li>• <span className="text-slate-450 font-medium">Fleet Manager</span> → Fleet, Maintenance</li>
              <li>• <span className="text-slate-450 font-medium">Dispatcher</span> → Dashboard, Trips</li>
              <li>• <span className="text-slate-450 font-medium">Safety Officer</span> → Drivers, Compliance</li>
              <li>• <span className="text-slate-450 font-medium">Financial Analyst</span> → Fuel & Expenses, Analytics</li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  );
}
