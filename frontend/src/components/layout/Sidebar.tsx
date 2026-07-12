import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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

export const Sidebar = () => {
  // Try to get location, fallback if not in a Router
  let location = { pathname: '/drivers' };
  try {
    location = useLocation();
  } catch (e) {
    // Ignore error if useLocation is used outside of Router for preview
  }

  return (
    <div className="w-64 h-screen bg-[#0A0C16] border-r border-[#1E2336] flex flex-col font-sans">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#4F46E5] flex items-center justify-center">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-white tracking-wide">TransitOps</h1>
      </div>
      
      <div className="px-6 py-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Overview
        </div>
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all group ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1" />}
                {!isActive && <div className="w-1.5 h-1.5 rounded-full bg-transparent mr-1 group-hover:bg-gray-600 transition-colors" />}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-[#1E2336]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm text-white font-medium">
            PS
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Fleet Manager</p>
            <p className="text-sm font-semibold text-white">Pravin Singh</p>
          </div>
        </div>
      </div>
    </div>
  );
};
