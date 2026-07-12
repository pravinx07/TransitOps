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
  LogOut,
  X
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const sidebarItems = [
  { name: 'Dashboard',      path: '/dashboard',     icon: LayoutDashboard },
  { name: 'Fleet',          path: '/vehicles',       icon: Truck },
  { name: 'Drivers',        path: '/drivers',        icon: Users },
  { name: 'Trips',          path: '/trips',          icon: Route },
  { name: 'Maintenance',    path: '/maintenance',    icon: Wrench },
  { name: 'Fuel & Expenses',path: '/fuel-expenses',  icon: Fuel },
  { name: 'Analytics',      path: '/analytics',      icon: BarChart3 },
  { name: 'Settings',       path: '/settings',       icon: Settings },
];

const roleAccessMap: Record<string, string[]> = {
  '/dashboard':    ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
  '/vehicles':     ['FLEET_MANAGER'],
  '/drivers':      ['SAFETY_OFFICER'],
  '/trips':        ['DRIVER'],
  '/maintenance':  ['FLEET_MANAGER'],
  '/fuel-expenses':['FINANCIAL_ANALYST'],
  '/analytics':    ['FINANCIAL_ANALYST'],
  '/settings':     ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
};

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userRole = user?.role || 'DRIVER';

  const hasAccess = (path: string) => {
    const allowed = roleAccessMap[path];
    return allowed ? allowed.includes(userRole) : true;
  };

  const formatRole = (roleStr: string) =>
    roleStr.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#4F46E5] flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-white tracking-wide">TransitOps</h1>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="px-4 flex-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-3">Overview</p>
        <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-0.5 pb-2 md:pb-0">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            const allowed = hasAccess(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all group ${
                  isActive
                    ? 'bg-[#1E2336] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#131826]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span className="text-sm">{item.name}</span>
                </div>
                {!allowed && (
                  <span title="Role restricted">
                    <Lock className="w-3 h-3 text-gray-700 shrink-0" />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User + logout */}
      <div className="p-4 border-t border-[#1E2336] space-y-3 shrink-0">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-medium">{formatRole(userRole)}</p>
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Guest'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 border border-[#1E2336] hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/40 text-gray-500 text-xs font-semibold rounded-lg transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen bg-[#0A0C16] border-r border-[#1E2336] sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile: backdrop + drawer — always mounted, animated with transform */}
      <div className="md:hidden">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />
        {/* Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0C16] border-r border-[#1E2336] flex flex-col transition-transform duration-300 ease-in-out ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
};
