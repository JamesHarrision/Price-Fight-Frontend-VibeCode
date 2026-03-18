import React, { useState, useEffect } from 'react';
import {
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ShieldCheck,
  Globe,
  Loader2
} from 'lucide-react';
import { getAdminStats } from '../../services/adminService';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, trend, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-14 h-14 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
        <Icon className="w-7 h-7" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
    <p className="text-3xl font-black text-gray-900">{value}</p>
  </div>
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        toast.error('Failed to load system stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
      <Loader2 className="w-10 h-10 animate-spin mb-4" />
      <p className="font-black uppercase tracking-widest text-[10px]">Analyzing Ecosystem Health...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gray-900 rounded-[40px] p-10 text-white shadow-2xl shadow-gray-950/20 group">
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">Systems Online.</h1>
          <p className="text-gray-400 font-bold max-w-md">The PriceFight ecosystem is running at optimal performance. Manage your arenas and participants below.</p>
        </div>
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 blur-[100px] -mr-32 -mt-32 rounded-full animate-pulse group-hover:bg-purple-600/30 transition-colors duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 blur-[80px] -ml-24 -mb-24 rounded-full animate-pulse duration-700"></div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          label="Total Revenue"
          value={`$${Number(stats?.totalRevenue || 0).toLocaleString()}`}
          trend={12}
          icon={TrendingUp}
          color="primary"
        />
        <StatCard
          label="Active Users"
          value={stats?.activeUsers || 0}
          trend={5}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Total Bids"
          value={stats?.ongoingBids || 0}
          trend={-2}
          icon={Zap}
          color="orange"
        />
        <StatCard
          label="Live Items"
          value={stats?.liveItems || 0}
          trend={8}
          icon={Package}
          color="purple"
        />
      </div>

      {/* Service Health - full width */}
      <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Service Health</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Cloudinary API', status: 'Operational', icon: Globe, color: 'green' },
            { label: 'Firebase RTDB', status: 'Optimal', icon: Zap, color: 'blue' },
            { label: 'Database Node', status: 'Secure', icon: ShieldCheck, color: 'primary' },
            { label: 'Mail Server', status: 'Operational', icon: Globe, color: 'green' },
          ].map((svc, i) => (
            <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
              <div className="flex items-center gap-3">
                <svc.icon className={`w-4 h-4 text-${svc.color}-600`} />
                <span className="text-xs font-bold text-gray-600">{svc.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-[10px] font-black text-green-600 uppercase italic">{svc.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
