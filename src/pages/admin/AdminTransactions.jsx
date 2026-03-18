import React, { useState, useEffect } from 'react';
import { Receipt, CheckCircle, XCircle, Clock, CreditCard, Loader2, ChevronDown, Package } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', icon: Clock, bg: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-400' },
  PAID: { label: 'Paid', icon: CheckCircle, bg: 'bg-green-50 text-green-600 border-green-100', dot: 'bg-green-400' },
  FAILED: { label: 'Expired', icon: XCircle, bg: 'bg-red-50 text-red-500 border-red-100', dot: 'bg-red-400' },
};

export const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/transactions');
      setTransactions(data.data || []);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = filter === 'ALL' ? transactions : transactions.filter(t => t.status === filter);

  const totalRevenue = transactions.filter(t => t.status === 'PAID').reduce((sum, t) => sum + Number(t.amount), 0);
  const pending = transactions.filter(t => t.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Collected', value: `$${totalRevenue.toLocaleString()}`, color: 'primary', Icon: CreditCard },
          { label: 'Pending', value: pending, color: 'amber', Icon: Clock },
          { label: 'Total Orders', value: transactions.length, color: 'blue', Icon: Receipt },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center mb-4`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['ALL', 'PENDING', 'PAID', 'FAILED'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-5 py-2 text-[10px] font-black rounded-xl border transition-all uppercase tracking-widest
              ${filter === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
          >
            {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label}
            {s !== 'ALL' && <span className="ml-1.5 opacity-60">({transactions.filter(t => t.status === s).length})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {['User', 'Item', 'Event', 'Amount', 'Date', 'Status'].map(h => (
                    <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(txn => {
                  const cfg = STATUS_CONFIG[txn.status] || STATUS_CONFIG.FAILED;
                  return (
                    <tr key={txn.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{txn.user?.full_name || '—'}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{txn.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {txn.item?.primary_image
                              ? <img src={txn.item.primary_image} className="w-full h-full object-cover" alt="" onError={e => e.target.style.display = 'none'} />
                              : <Package className="w-5 h-5 text-gray-300" />}
                          </div>
                          <p className="font-bold text-gray-800 text-sm uppercase italic tracking-tight">{txn.item?.name || '—'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500 font-medium">{txn.item?.event?.title || '—'}</td>
                      <td className="px-6 py-5">
                        <span className="text-lg font-black text-gray-900">${Number(txn.amount).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5 text-[11px] text-gray-400 font-bold">
                        {new Date(txn.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.bg}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></div>
                          {cfg.label}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
