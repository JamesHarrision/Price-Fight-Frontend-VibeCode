import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  LayoutDashboard,
  Package,
  Calendar,
  LogOut,
  Menu,
  X,
  Trophy,
  History,
  Receipt,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation, Outlet, useNavigate, Navigate } from 'react-router-dom';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Terminal', path: '/admin', icon: LayoutDashboard },
    { name: 'Arenas', path: '/admin/events', icon: Calendar },
    { name: 'Contenders', path: '/admin/users', icon: Users },
    { name: 'Assets', path: '/admin/items', icon: Package },
    { name: 'Transactions', path: '/admin/transactions', icon: Receipt },
  ];

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/403" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 bg-white border-r border-gray-100 transition-all duration-300 transform 
        ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'} `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link to="/" className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Trophy className="w-6 h-6" />
            </div>
            {isSidebarOpen && (
              <div>
                <span className="font-black text-xl tracking-tighter text-gray-900 leading-none block">PriceFight</span>
                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest leading-none">Admin Panel</span>
              </div>
            )}
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group
                  ${isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'} `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  {isSidebarOpen && <span className="font-bold text-sm">{item.name}</span>}
                  {isSidebarOpen && isActive && <ChevronRight className="ml-auto w-4 h-4" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer User Profile */}
          <div className="p-4 border-t border-gray-50">
            <div className={`p-4 rounded-3xl bg-gray-50 flex items-center gap-3 ${isSidebarOpen ? '' : 'justify-center'}`}>
              <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center font-black text-gray-400">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate">{user?.full_name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Super Admin</p>
                </div>
              )}
              {isSidebarOpen && (
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-lg font-black text-gray-900">
              {navItems.find(i => i.path === location.pathname)?.name || 'Overview'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Status</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-black text-gray-900 uppercase italic">System Live</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          <div className="max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
