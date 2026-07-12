
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  Lock,
  LogOut
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const sidebarItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Fleet', path: '/vehicles', icon: Truck },
  { name: 'Drivers', path: '/drivers', icon: Users },
  { name: 'Trips', path: '/trips', icon: Route },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Fuel & Expenses', path: '/fuel-expenses', icon: Fuel },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const roleAccessMap: Record<string, string[]> = {
  "/dashboard": ["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  "/vehicles": ["FLEET_MANAGER"],
  "/drivers": ["SAFETY_OFFICER"],
  "/trips": ["DRIVER"],
  "/maintenance": ["FLEET_MANAGER"],
  "/fuel-expenses": ["FINANCIAL_ANALYST"],
  "/analytics": ["FINANCIAL_ANALYST"],
  "/settings": ["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"]
};

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userRole = user?.role || "DRIVER";

  const hasAccess = (path: string) => {
    const allowed = roleAccessMap[path];
    return allowed ? allowed.includes(userRole) : true;
  };

  const formatRole = (roleStr: string) => {
    return roleStr
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="w-64 h-screen bg-[#0A0C16] border-r border-[#1E2336] flex flex-col font-sans shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#4F46E5] flex items-center justify-center">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-white tracking-wide">TransitOps</h1>
      </div>
      
      <div className="px-6 py-2 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Overview
        </div>
        <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 pb-2 md:pb-0">
          {sidebarItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const allowed = hasAccess(item.path);
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all group ${
                  isActive 
                    ? 'text-white bg-[#131826]/50' 
                    : 'text-gray-400 hover:text-white hover:bg-[#131826]/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1" />}
                  {!isActive && <div className="w-1.5 h-1.5 rounded-full bg-transparent mr-1 group-hover:bg-gray-600 transition-colors" />}
                  <span>{item.name}</span>
                </div>
                {!allowed && (
                  <span title="Locked: Scoped Role required">
                    <Lock className="w-3.5 h-3.5 text-gray-600 hover:text-red-400 shrink-0" />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-[#1E2336] flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm text-white font-medium shrink-0">
            {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium truncate">{user ? formatRole(user.role) : "Guest"}</p>
            <p className="text-sm font-semibold text-white truncate">{user?.name || "Guest User"}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 bg-slate-950 hover:bg-red-950/20 hover:text-red-400 border border-slate-900 text-slate-400 text-xs font-semibold rounded-md transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
