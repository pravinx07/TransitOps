import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Role } from '../../types/auth';
import { useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("FLEET_MANAGER");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await login(email, password, role);
    setIsSubmitting(false);

    if (result.success) {
      toast(`Successfully signed in as ${role.replace('_', ' ')}`, 'success');
      navigate("/dashboard");
    } else {
      if (result.errors) {
        setErrors(result.errors);
      }
      toast(result.message || "Failed to sign in. Please verify your credentials.", 'error');
    }
  };

  return (
    <div className="relative w-full md:w-[55%] flex items-center justify-center p-8 md:p-12 min-h-[auto] md:min-h-screen py-12 md:py-0">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-700 delay-300">
        
        {/* Glassmorphism Card */}
        <div className="bg-[#11151F]/80 backdrop-blur-xl border border-[#23293D] rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/50">
          
          <div className="space-y-2 mb-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="text-sm text-gray-400">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400 text-gray-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@transitops.com"
                  className={`w-full bg-[#0A0C10] border ${
                    errors.email ? "border-red-500/50 focus:ring-red-500/20" : "border-[#23293D] focus:border-blue-500 focus:ring-blue-500/20"
                  } rounded-xl py-3 pl-11 pr-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-4 transition-all`}
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
                  } rounded-xl py-3 pl-4 pr-11 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-4 transition-all [&::-ms-reveal]:hidden`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
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

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center space-x-3 text-gray-400 select-none cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded-md bg-[#0A0C10] checked:bg-blue-500 checked:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span className="group-hover:text-gray-300 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full flex items-center justify-center space-x-2 py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
            >
              <span>{isSubmitting ? "Authenticating..." : "Sign In securely"}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
