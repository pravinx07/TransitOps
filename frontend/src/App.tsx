import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VehiclesPage from './pages/VehiclesPage';
import DriversPage from './pages/DriversPage';
import TripsPage from './pages/TripsPage';
import MaintenancePage from './pages/MaintenancePage';
import FuelExpensesPage from './pages/FuelExpensesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import { Lock, Menu, X, Truck } from 'lucide-react';

// 1. Session Protection Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-slate-400 text-xs tracking-widest font-bold font-sans">
        VERIFYING SESSION...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// 2. Access Denied Overlay View
function AccessDenied({ requiredRoles }: { requiredRoles: string[] }) {
  const { user } = useAuth();
  
  const formatRole = (roleStr: string) => {
    return roleStr
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-5 max-w-md mx-auto font-sans p-6">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <Lock className="h-6 w-6 text-red-400 animate-pulse" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-black text-red-200">Access Restricted</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          Your current session role (<span className="text-amber-500 font-bold">{user ? formatRole(user.role) : "Guest"}</span>) does not have authorization to view this component.
        </p>
      </div>
      <div className="pt-4 border-t border-[#1E2336] w-full text-[10px] text-gray-500">
        <span className="font-bold uppercase tracking-widest block mb-1">Required Role</span>
        <span>{requiredRoles.map(r => formatRole(r)).join(", ")}</span>
      </div>
    </div>
  );
}

// 3. RBAC Route Guard
interface RoleProtectedRouteProps {
  pathId: string;
  children: React.ReactNode;
}

function RoleProtectedRoute({ pathId, children }: RoleProtectedRouteProps) {
  const { user, rbac } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  // If rbac is not fully loaded yet (or empty) but user is manager, let them pass or fallback to a default check
  // Better yet, just check the map. If it's empty, fallback to basic check.
  const safeRbac = rbac || {};
  const allowedRoles = safeRbac[pathId] || [];
  
  // Settings and Dashboard are open to all logged in users.
  if (pathId === "/dashboard" || pathId === "/settings") {
    return <>{children}</>;
  }

  // Admin override or check map
  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess && Object.keys(safeRbac).length > 0) {
    return <AccessDenied requiredRoles={allowedRoles} />;
  }
  
  return <>{children}</>;
}

// 4. Protected Sidebar Layout
function ProtectedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex bg-[#07090E] min-h-screen text-white w-full">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0A0C16] border-b border-[#1E2336] sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1E2336] transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#4F46E5] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">TransitOps</span>
            </div>
            <div className="w-9" /> {/* spacer to center logo */}
          </header>

          <main className="flex-1 p-4 md:p-8 md:border-l md:border-[#1E2336] overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Login Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Subpages with Sidebar Layout */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            <Route
              path="/vehicles"
              element={
                <RoleProtectedRoute pathId="/vehicles">
                  <VehiclesPage />
                </RoleProtectedRoute>
              }
            />
            
            <Route
              path="/drivers"
              element={
                <RoleProtectedRoute pathId="/drivers">
                  <DriversPage />
                </RoleProtectedRoute>
              }
            />
            
            <Route
              path="/trips"
              element={
                <RoleProtectedRoute pathId="/trips">
                  <TripsPage />
                </RoleProtectedRoute>
              }
            />
            
            <Route
              path="/maintenance"
              element={
                <RoleProtectedRoute pathId="/maintenance">
                  <MaintenancePage />
                </RoleProtectedRoute>
              }
            />
            
            <Route
              path="/fuel-expenses"
              element={
                <RoleProtectedRoute pathId="/fuel-expenses">
                  <FuelExpensesPage />
                </RoleProtectedRoute>
              }
            />
            
            <Route
              path="/analytics"
              element={
                <RoleProtectedRoute pathId="/analytics">
                  <AnalyticsPage />
                </RoleProtectedRoute>
              }
            />
            
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
