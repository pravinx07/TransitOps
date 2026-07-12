import React from 'react';
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
import { Lock } from 'lucide-react';

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
  allowedRoles: string[];
  children: React.ReactNode;
}

function RoleProtectedRoute({ allowedRoles, children }: RoleProtectedRouteProps) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (!allowedRoles.includes(user.role)) {
    return <AccessDenied requiredRoles={allowedRoles} />;
  }
  
  return <>{children}</>;
}

// 4. Protected Sidebar Layout
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <div className="flex bg-[#07090E] min-h-screen text-white w-full">
        <Sidebar />
        <main className="flex-1 p-8 border-l border-[#1E2336] overflow-y-auto">
          <Outlet />
        </main>
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
                <RoleProtectedRoute allowedRoles={["FLEET_MANAGER"]}>
                  <VehiclesPage />
                </RoleProtectedRoute>
              }
            />
            
            <Route
              path="/drivers"
              element={
                <RoleProtectedRoute allowedRoles={["SAFETY_OFFICER"]}>
                  <DriversPage />
                </RoleProtectedRoute>
              }
            />
            
            <Route
              path="/trips"
              element={
                <RoleProtectedRoute allowedRoles={["DRIVER"]}>
                  <TripsPage />
                </RoleProtectedRoute>
              }
            />
            
            <Route
              path="/maintenance"
              element={
                <RoleProtectedRoute allowedRoles={["FLEET_MANAGER"]}>
                  <MaintenancePage />
                </RoleProtectedRoute>
              }
            />
            
            <Route
              path="/fuel-expenses"
              element={
                <RoleProtectedRoute allowedRoles={["FINANCIAL_ANALYST"]}>
                  <FuelExpensesPage />
                </RoleProtectedRoute>
              }
            />
            
            <Route
              path="/analytics"
              element={
                <RoleProtectedRoute allowedRoles={["FINANCIAL_ANALYST"]}>
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
