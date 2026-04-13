import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserTransactions, payTransaction } from '../services/transactionService';
import { Receipt, CheckCircle, XCircle, Clock, CreditCard, Loader2, AlertCircle, Package, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending Payment', icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-400' },
  PAID: { label: 'Paid', icon: CheckCircle, color: 'bg-green-50 text-green-600 border-green-100', dot: 'bg-green-400' },
  FAILED: { label: 'Expired', icon: XCircle, color: 'bg-red-50 text-red-500 border-red-100', dot: 'bg-red-400' },
};

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const result = await getUserTransactions();
      setTransactions(result.data || []);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handlePay = async (transactionId) => {
    if (!window.confirm('Confirm payment? This will deduct the amount from your wallet balance.')) return;
    setPayingId(transactionId);
    try {
      const result = await payTransaction(transactionId);
      toast.success(`Payment successful! New balance: $${Number(result.data?.currentBalance).toLocaleString()}`);
      fetchTransactions();
    } catch (err) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setPayingId(null);
    }
  };

  const filtered = filter === 'ALL' ? transactions : transactions.filter(t => t.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-gradient-to-tr from-primary-600 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Transactions</h1>
              <p className="text-gray-500 text-sm font-medium">Your auction payment history</p>
            </div>
          </Link>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            {['ALL', 'PENDING', 'PAID', 'FAILED'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-5 py-2 text-[10px] font-black rounded-xl border transition-all uppercase tracking-widest
                  ${filter === s ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
              >
                {s === 'ALL' ? 'All' : STATUS_CONFIG[s].label}
                {s !== 'ALL' && (
                  <span className="ml-2 text-[9px]">
                    ({transactions.filter(t => t.status === s).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-dashed border-gray-200 py-20 text-center">
            <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">
              {filter === 'ALL' ? 'No transactions yet.' : `No ${STATUS_CONFIG[filter]?.label} transactions.`}
            </p>
            <Link to="/" className="mt-4 inline-block text-sm text-primary-600 font-bold hover:text-primary-700 transition-colors">
              Browse Events →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(txn => {
              const cfg = STATUS_CONFIG[txn.status] || STATUS_CONFIG.FAILED;
              const StatusIcon = cfg.icon;
              const isPaying = payingId === txn.id;

              return (
                <div key={txn.id} className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:shadow-gray-100/80 transition-all duration-500 group">
                  <div className="flex items-start gap-5">

                    {/* Item thumbnail */}
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
                      {txn.item?.primary_image ? (
                        <img
                          src={txn.item.primary_image}
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt={txn.item?.name}
                        />
                      ) : null}
                      <div className="w-full h-full items-center justify-center bg-gray-100 hidden">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="font-black text-gray-900 text-lg uppercase italic tracking-tight truncate">
                            {txn.item?.name || 'Unknown Item'}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widestest mt-1">
                            Event: {txn.item?.event?.title || 'N/A'}
                          </p>
                          <p className="text-[10px] font-bold text-gray-300 mt-0.5">
                            {new Date(txn.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Amount */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-black text-gray-900">
                            ${Number(txn.amount).toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Winning Bid</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                        {/* Status badge */}
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></div>
                          {cfg.label}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          {txn.item?.id && (
                            <Link
                              to={`/items/${txn.item.id}`}
                              className="flex items-center gap-1 text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors"
                            >
                              View Item <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                          {txn.status === 'PENDING' && (
                            <button
                              onClick={() => handlePay(txn.id)}
                              disabled={isPaying}
                              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/30 hover:from-primary-700 hover:to-purple-700 active:scale-95 transition-all disabled:opacity-70"
                            >
                              {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                              {isPaying ? 'Processing...' : 'Confirm Payment'}
                            </button>
                          )}
                          {txn.status === 'FAILED' && (
                            <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-black uppercase tracking-widest">
                              <AlertCircle className="w-4 h-4" />
                              Payment window expired
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back to dashboard */}
        <div className="mt-10 text-center">
          <Link to="/" className="text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
