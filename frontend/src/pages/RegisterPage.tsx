import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/auth";
import { useNavigate } from "react-router-dom";
import { Truck, AlertCircle, ShieldAlert, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("FLEET_MANAGER");
  const [showPassword, setShowPassword] = useState(false);

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

    if (!name) {
      newErrors.name = "Name is required";
    }

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
    const result = await register(name, email, password, role);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } else {
      if (result.errors) {
        setErrors(result.errors);
      }
      setGeneralError(result.message || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0A0C10] font-sans selection:bg-blue-500/30">
      
      {/* Left panel - Hero Section */}
      <div className="relative hidden md:flex w-full md:w-[45%] flex-col justify-between p-8 md:p-14 overflow-hidden border-r border-[#1E2336] bg-[#0D1117]">
        
        {/* Dynamic Background Gradients */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none transform translate-x-1/3 translate-y-1/3" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-20 animate-in slide-in-from-top-4 duration-700">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white block leading-tight">TransitOps</span>
              <span className="text-[11px] text-blue-400 font-medium tracking-wide uppercase block mt-0.5">Smart Transport Platform</span>
            </div>
          </div>

          <div className="space-y-8 animate-in slide-in-from-left-8 duration-700 delay-150">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Join the future of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">fleet management.</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm">
              Create an account to connect your operations and gain total control.
            </p>
            
            <div className="space-y-5 pt-4">
              {[
                { name: "Fleet Manager", desc: "Monitors asset statuses and workshop entries." },
                { name: "Dispatcher", desc: "Schedules route assignments and dispatches." },
                { name: "Safety Officer", desc: "Audits driving licenses and compliance." },
                { name: "Financial Analyst", desc: "Tracks expense reports and asset ROI." }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-4 group cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 group-hover:scale-[2] group-hover:bg-indigo-400 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <div className="transform group-hover:translate-x-2 transition-transform duration-300">
                    <span className="text-sm font-semibold text-gray-200 block">{item.name}</span>
                    <span className="text-xs text-gray-500 block leading-tight mt-0.5">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 md:mt-0 text-[11px] text-gray-600 font-medium tracking-wider uppercase">
          &copy; 2026 TransitOps. Secure RBAC Portal.
        </div>
      </div>

      {/* Right panel - Register Form */}
      <div className="relative w-full md:w-[55%] flex items-center justify-center p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>

        <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-700 delay-300">
          
          {/* Glassmorphism Card */}
          <div className="bg-[#11151F]/80 backdrop-blur-xl border border-[#23293D] rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/50">
            
            <div className="space-y-2 mb-10 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white">Create an account</h1>
              <p className="text-sm text-gray-400">Join TransitOps today</p>
            </div>

            {/* General Alert Box */}
            {generalError && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-start space-x-3 text-sm animate-in slide-in-from-top-2">
                <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Registration Failed</span>
                  <span className="block text-xs mt-1 text-red-300/80">{generalError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 block uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className={`w-full bg-[#0A0C10] border ${
                      errors.name ? "border-red-500/50 focus:ring-red-500/20" : "border-[#23293D] focus:border-blue-500 focus:ring-blue-500/20"
                    } rounded-xl py-3 px-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-4 transition-all`}
                  />
                </div>
                {errors.name && (
                  <div className="flex items-center space-x-1.5 text-red-400 text-xs mt-1.5 ml-1 animate-in fade-in">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 block uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@transitops.com"
                    className={`w-full bg-[#0A0C10] border ${
                      errors.email ? "border-red-500/50 focus:ring-red-500/20" : "border-[#23293D] focus:border-blue-500 focus:ring-blue-500/20"
                    } rounded-xl py-3 px-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-4 transition-all`}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center space-x-1.5 text-red-400 text-xs mt-1.5 ml-1 animate-in fade-in">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 block uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-[#0A0C10] border ${
                      errors.password ? "border-red-500/50 focus:ring-red-500/20" : "border-[#23293D] focus:border-blue-500 focus:ring-blue-500/20"
                    } rounded-xl py-3 pl-4 pr-11 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-4 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center space-x-1.5 text-red-400 text-xs mt-1.5 ml-1 animate-in fade-in">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Role Select Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 block uppercase tracking-wider ml-1">Select Role</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className={`w-full bg-[#0A0C10] border ${
                      errors.role ? "border-red-500/50 focus:ring-red-500/20" : "border-[#23293D] focus:border-blue-500 focus:ring-blue-500/20"
                    } rounded-xl py-3 px-4 text-sm text-gray-200 focus:outline-none focus:ring-4 transition-all appearance-none cursor-pointer`}
                  >
                    <option value="FLEET_MANAGER">Fleet Manager</option>
                    <option value="DRIVER">Dispatcher / Driver</option>
                    <option value="SAFETY_OFFICER">Safety Officer</option>
                    <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                  </select>
                  {/* Custom Arrow */}
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full flex items-center justify-center space-x-2 py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
              >
                <span>{isSubmitting ? "Creating account..." : "Sign Up"}</span>
                {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
              
              {/* Login Link */}
              <div className="text-center mt-6 text-sm text-gray-400">
                Already have an account?{' '}
                <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Sign in
                </a>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
