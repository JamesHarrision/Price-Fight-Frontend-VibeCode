import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ShieldCheck, Receipt, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <span className="font-black text-2xl tracking-tighter text-gray-900 leading-none block">PriceFight</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Auction Platform</span>
        </div>
      </Link>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-100/50 rounded-xl border border-gray-100">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Balance</p>
            <p className="text-sm font-bold text-gray-900 leading-none">${parseFloat(user?.balance || 0).toLocaleString()}</p>
          </div>
        </div>

        {user?.role === 'ADMIN' && (
          <Link
            to="/admin"
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-900/20 hover:scale-105 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-primary-400" />
            Command Center
          </Link>
        )}
        <Link
          to="/transactions"
          className="flex items-center gap-2 px-4 py-2 text-gray-500 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-primary-600 hover:border-primary-100 hover:bg-primary-50 transition-all"
        >
          <Receipt className="w-4 h-4" />
          My Orders
        </Link>
        <Link
          to="/profile"
          className="flex items-center gap-3 text-sm font-bold text-gray-700 cursor-pointer hover:text-primary-600 transition-colors"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <span className="hidden sm:inline">{user?.full_name || 'My Profile'}</span>
        </Link>
        <button
          onClick={logout}
          className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};
