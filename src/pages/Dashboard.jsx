import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllEvents } from '../services/eventService';
import { EventCard } from '../components/EventCard';
import { LogOut, User, RefreshCw, Trophy, LayoutGrid, ShieldCheck, Zap, Clock, CheckCircle2, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const result = await getAllEvents(1, 20, activeTab === 'ALL' ? undefined : activeTab);
        setEvents(result.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50/50">
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

      <main className="max-w-7xl mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Active Auctions</h1>
            <p className="text-gray-500 font-medium">Find exclusive items and place your winning bid.</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            {[
              { id: 'ALL', label: 'All Arenas', icon: LayoutGrid },
              { id: 'ONGOING', label: 'Live Now', icon: Zap },
              { id: 'PENDING', label: 'Upcoming', icon: Clock },
              { id: 'ENDED', label: 'Archived', icon: CheckCircle2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
            <div className="w-px h-6 bg-gray-100 mx-2 hidden sm:block"></div>
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[450px] bg-gray-100 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No auctions found</h2>
            <p className="text-gray-500">Check back later for new exciting events.</p>
          </div>
        )}
      </main>
    </div>
  );
};
