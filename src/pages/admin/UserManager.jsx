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

  // Nạp tiền Modal State
  const [depositUser, setDepositUser] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

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

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setIsDepositing(true);
    try {
      const userToUpdate = users.find(u => u.id === depositUser.id);
      const newBalance = Number(userToUpdate.balance) + Number(depositAmount);
      
      await updateUserByAdmin(depositUser.id, { balance: newBalance });
      toast.success(`Đã nạp $${Number(depositAmount).toLocaleString()} cho ${depositUser.full_name}`);
      setDepositUser(null);
      setDepositAmount('');
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Nạp tiền thất bại');
    } finally {
      setIsDepositing(false);
    }
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Quản Lý Người Dùng</h1>
          <p className="text-gray-500 font-medium">Theo dõi và quản lý dữ liệu người tham gia.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Tổng Số Lượng</p>
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
              placeholder="TÌM KIẾM THEO TÊN HOẶC EMAIL..."
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
            <span className="text-[10px] font-black text-gray-400 px-4 uppercase tracking-widest">Trang {page} / {totalPages}</span>
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
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Người Dùng</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phân Quyền</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Số Dư (VND)</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tham Gia</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao Tác</th>
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
                        <p className="text-[10px] font-black text-gray-300 uppercase italic tracking-tighter">Ngày Đăng Ký</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDepositUser(user)}
                          className="p-3 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded-2xl transition-all"
                          title="Chuyển tiền / Deposit"
                        >
                          <DollarSign className="w-5 h-5" />
                        </button>
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
                    <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Không có người dùng nào khớp với tìm kiếm.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tích hợp Modal Nạp Tiền ngay trong Component */}
      {depositUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-8">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight mb-2">Nạp Tiền Giao Dịch</h2>
              <p className="text-gray-500 text-sm font-medium mb-8">
                Chỉ định nạp thêm tiền vào Liquid Assets của <span className="font-bold text-gray-900">{depositUser.full_name}</span>.
              </p>

              <form onSubmit={handleDeposit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Số tiền cần nạp (đ)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      min="1"
                      step="1"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-green-500/20 transition-all"
                      required
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[50, 100, 500, 1000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDepositAmount(val)}
                        className="flex-1 py-2 bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-500 text-xs font-bold rounded-xl transition-colors"
                      >
                        +${val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setDepositUser(null); setDepositAmount(''); }}
                    className="flex-1 py-4 text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="submit"
                    disabled={isDepositing}
                    className="flex-1 py-4 text-sm font-black uppercase tracking-widest text-white bg-gray-900 hover:bg-green-600 rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDepositing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'NẠP TIỀN'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
