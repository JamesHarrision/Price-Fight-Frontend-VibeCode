import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllEvents } from '../services/eventService';
import { EventCard } from '../components/EventCard';
import { Navbar } from '../components/Navbar';
import { DashboardHero } from '../components/DashboardHero';
import { TrustSignals } from '../components/TrustSignals';
import { LogOut, User, RefreshCw, Trophy, LayoutGrid, ShieldCheck, Zap, Clock, CheckCircle2, Receipt, Search, ArrowDownAZ, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const result = await getAllEvents(1, 50, activeTab === 'ALL' ? undefined : activeTab);
        setEvents(result.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [activeTab]);

  const filteredAndSortedEvents = useMemo(() => {
    let result = events;

    if (searchQuery.trim() !== '') {
      const lower = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(lower) || 
        (e.description && e.description.toLowerCase().includes(lower))
      );
    }

    let sortedResult = [...result];
    switch (sortOrder) {
      case 'newest':
        sortedResult.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
        break;
      case 'closing_soon':
        sortedResult.sort((a, b) => new Date(a.end_time) - new Date(b.end_time));
        break;
      case 'alpha':
        sortedResult.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    
    return sortedResult;
  }, [events, searchQuery, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <DashboardHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <TrustSignals />

      <main className="max-w-7xl mx-auto py-16 px-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 border-b border-gray-200 pb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Danh Sách Sự Kiện</h2>
            <p className="text-gray-500 font-medium">Hiển thị {filteredAndSortedEvents.length} kết quả.</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
              {[
                { id: 'ALL', label: 'Tất cả', icon: LayoutGrid },
                { id: 'ONGOING', label: 'Đang diễn ra', icon: Zap },
                { id: 'PENDING', label: 'Sắp diễn ra', icon: Clock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                  ${activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>

            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer shadow-sm"
              >
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="closing_soon">Sắp xếp: Sắp đóng cửa</option>
                <option value="alpha">Sắp xếp: A-Z</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <ArrowDownAZ className="w-4 h-4" />
              </div>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="p-2.5 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-primary-600 shadow-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[450px] bg-gray-100 animate-pulse rounded-3xl border border-gray-200"></div>
            ))}
          </div>
        ) : filteredAndSortedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredAndSortedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Không tìm thấy sự kiện nào</h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto">
              Hãy thử điều chỉnh bộ lọc hoặc xóa từ khóa tìm kiếm để xem các sự kiện khác.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveTab('ALL'); }}
              className="mt-8 px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
