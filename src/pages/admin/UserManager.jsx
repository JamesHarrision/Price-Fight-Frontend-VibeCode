import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserByAdmin } from '../../services/userService';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Shield,
  Calendar,
  DollarSign,
  UserCheck,
  UserX,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

export const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    active: 0
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers(page, 10, search);
      setUsers(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      // Mock stats for UI vibrancy if backend doesn't provide summary
      setStats({
        total: result.pagination?.totalItems || 0,
        admins: (result.data || []).filter(u => u.role === 'ADMIN').length,
        active: (result.data || []).length
      });
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Elevate/Demote contender to ${newRole}?`)) return;

    try {
      await updateUserByAdmin(userId, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  const handleRestrictAccess = async (userId) => {
    if (!window.confirm('Are you sure you want to restrict this contender\'s access?')) return;
    toast.error('Access restriction logic pending backend status field');
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const getRoleStyle = (role) => {
    return role === 'ADMIN'
      ? 'bg-purple-50 text-purple-600 border-purple-100'
      : 'bg-blue-50 text-blue-600 border-blue-100';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">User Directorate</h1>
          <p className="text-gray-500 font-medium">Monitor and manage the contender database.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Total Population</p>
              <p className="text-xl font-black text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
            <input
              type="text"
              placeholder="SEARCH BY IDENTITY OR ALIAS..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-[20px] text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-gray-950/5 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-3 bg-gray-50 rounded-xl disabled:opacity-30 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-black text-gray-400 px-4 uppercase tracking-widest">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-3 bg-gray-50 rounded-xl disabled:opacity-30 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contender Profile</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Clearance</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Liquid Assets</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timeline</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-8 py-10 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-gray-400">
                              {user.full_name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 leading-tight uppercase tracking-tight">{user.full_name}</p>
                          <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 mt-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 text-[10px] font-black rounded-full border uppercase tracking-widest ${getRoleStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <p className="font-black text-gray-900">${Number(user.balance).toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <p className="text-[10px] font-black text-gray-300 uppercase italic tracking-tighter">Registered</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateRole(user.id, user.role)}
                          className="p-3 text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"
                          title="Edit Clearance"
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRestrictAccess(user.id)}
                          className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                          title="Restrict Access"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
                      <UserX className="w-10 h-10 text-gray-200" />
                    </div>
                    <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">No contenders match the current filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
