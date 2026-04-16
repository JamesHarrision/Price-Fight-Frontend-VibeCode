import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, User, ShieldCheck, LogOut, Receipt } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center">
        <button className="p-2 -ml-2 text-gray-500 hover:text-black transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </div>

      <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity absolute left-1/2 -translate-x-1/2">
        <span className="font-black text-xl tracking-widest text-gray-900 leading-none">AUCTION<span className="text-primary-400 mx-1">•</span>LIVE</span>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right mr-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Số dư</p>
            <p className="text-sm font-bold text-primary-500 leading-none">{parseFloat(user?.balance || 0).toLocaleString()} đ</p>
          </div>
          
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-primary-400" />
              <span className="hidden lg:inline">Quản trị</span>
            </Link>
          )}
          
          <Link
            to="/transactions"
            className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 transition-colors text-sm font-bold"
          >
            <Receipt className="w-4 h-4" />
            <span className="hidden lg:inline">Lịch sử</span>
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer hover:text-primary-600 transition-colors ml-2"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className="hidden xl:inline">{user?.full_name || 'Tài khoản'}</span>
          </Link>
          
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <button className="md:hidden p-2 -mr-2 text-gray-900 hover:text-primary-500 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};
