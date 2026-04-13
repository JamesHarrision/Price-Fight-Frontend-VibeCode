import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserTransactions, payTransaction } from '../services/transactionService';
import { getMyBids } from '../services/userService';
import { Receipt, CheckCircle, XCircle, Clock, CreditCard, Loader2, AlertCircle, Package, ExternalLink, Activity, ArrowRight, Gavel, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending Payment', icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-400' },
  PAID: { label: 'Paid', icon: CheckCircle, color: 'bg-green-50 text-green-600 border-green-100', dot: 'bg-green-400' },
  FAILED: { label: 'Expired', icon: XCircle, color: 'bg-red-50 text-red-500 border-red-100', dot: 'bg-red-400' },
};

export const Transactions = () => {
  const [activeTab, setActiveTab] = useState('LIVE_BIDS'); // 'LIVE_BIDS' | 'WON_ITEMS'
  
  // States for Won Items (Transactions)
  const [transactions, setTransactions] = useState([]);
  const [txnLoading, setTxnLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [txnFilter, setTxnFilter] = useState('ALL');

  // States for Live Bids
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(true);

  // Initial Fetch
  useEffect(() => {
    if (activeTab === 'WON_ITEMS') {
      fetchTransactions();
    } else {
      fetchBids();
    }
  }, [activeTab]);

  const fetchTransactions = async () => {
    setTxnLoading(true);
    try {
      const result = await getUserTransactions();
      setTransactions(result.data || []);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setTxnLoading(false);
    }
  };

  const fetchBids = async () => {
    setBidsLoading(true);
    try {
      const result = await getMyBids();
      setBids(result || []);
    } catch (err) {
      toast.error('Failed to load live bids');
    } finally {
      setBidsLoading(false);
    }
  };

  const handlePay = async (transactionId) => {
    if (!window.confirm('Confirm payment? This will deduct the amount from your wallet balance.')) return;
    setPayingId(transactionId);
    try {
      const result = await payTransaction(transactionId);
      toast.success(`Payment successful! New balance: $${Number(result.data?.currentBalance).toLocaleString()}`);
      fetchTransactions();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setPayingId(null);
    }
  };

  const filteredTxns = txnFilter === 'ALL' ? transactions : transactions.filter(t => t.status === txnFilter);

  // Renderers
  const renderLiveBids = () => {
    if (bidsLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
    
    if (bids.length === 0) {
      return (
        <div className="bg-white rounded-[32px] border border-dashed border-gray-200 py-20 text-center">
          <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">No active bids</p>
          <Link to="/" className="mt-4 inline-block text-sm text-primary-600 font-bold hover:text-primary-700 transition-colors">
            Start Bidding →
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bids.map(item => {
          const myHighestBid = item.bids?.[0]?.amount || 0;
          const isHighestBidder = Number(myHighestBid) === Number(item.current_price);
          const isEventActive = item.event?.status === 'ONGOING';

          return (
            <div key={item.id} className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 transition-all group relative overflow-hidden">
              {/* Event Status Tag */}
              <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest
                ${isEventActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {isEventActive ? 'Live' : item.event?.status}
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {item.primary_image ? (
                    <img src={item.primary_image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : <Package className="w-8 h-8 m-auto mt-4 text-gray-300" />}
                </div>
                <div className="min-w-0 pr-8">
                  <h3 className="font-black text-gray-900 truncate leading-tight">{item.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate">{item.event?.title}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Current Price</span>
                  <span className="font-black text-gray-900">${Number(item.current_price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200/60 pt-3">
                  <span className="text-[10px] text-primary-600 font-bold uppercase">My Highest Bid</span>
                  <div className="text-right">
                    <span className="font-black text-primary-600 block">${Number(myHighestBid).toLocaleString()}</span>
                    {isEventActive && (
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${isHighestBidder ? 'text-green-500' : 'text-red-500'}`}>
                        {isHighestBidder ? 'Winning!' : 'Outbid'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link
                to={`/items/${item.id}`}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-colors"
              >
                Go to Arena <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWonItems = () => {
    if (txnLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
    return (
      <>
        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {['ALL', 'PENDING', 'PAID', 'FAILED'].map(s => (
            <button
              key={s}
              onClick={() => setTxnFilter(s)}
              className={`px-5 py-2 text-[10px] font-black rounded-xl border transition-all uppercase tracking-widest
                ${txnFilter === s ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
            >
              {s === 'ALL' ? 'All Invoices' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {filteredTxns.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-dashed border-gray-200 py-20 text-center">
            <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">No won items in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTxns.map(txn => {
              const cfg = STATUS_CONFIG[txn.status] || STATUS_CONFIG.FAILED;
              const StatusIcon = cfg.icon;
              const isPaying = payingId === txn.id;

              return (
                <div key={txn.id} className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:shadow-gray-100/80 transition-all duration-500 group">
                  <div className="flex items-start gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
                      {txn.item?.primary_image ? (
                        <img src={txn.item.primary_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={txn.item?.name} />
                      ) : <Package className="w-8 h-8 text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="font-black text-gray-900 text-lg uppercase italic tracking-tight truncate">
                            {txn.item?.name || 'Unknown Item'}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Event: {txn.item?.event?.title || 'N/A'}
                          </p>
                          <p className="text-[10px] font-bold text-gray-300 mt-0.5">
                            {new Date(txn.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-black text-gray-900">${Number(txn.amount).toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Final Invoice</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></div>
                          {cfg.label}
                        </div>
                        <div className="flex items-center gap-3">
                          {txn.item?.id && (
                            <Link to={`/items/${txn.item.id}`} className="flex items-center gap-1 text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors">
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
                              {isPaying ? 'Processing...' : 'Pay Invoice'}
                            </button>
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
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Title */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">My Dashboard</h1>
            <p className="text-gray-500 font-medium">Track your active bids and manage won item invoices.</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('LIVE_BIDS')}
            className={`flex items-center gap-2 pb-4 px-6 text-sm font-black uppercase tracking-widest transition-colors whitespace-nowrap border-b-2
            ${activeTab === 'LIVE_BIDS' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <Activity className="w-5 h-5" /> Active Bids
          </button>
          <button
            onClick={() => setActiveTab('WON_ITEMS')}
            className={`flex items-center gap-2 pb-4 px-6 text-sm font-black uppercase tracking-widest transition-colors whitespace-nowrap border-b-2
            ${activeTab === 'WON_ITEMS' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <Trophy className="w-5 h-5" /> Won Items & Invoices
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
          {activeTab === 'LIVE_BIDS' ? renderLiveBids() : renderWonItems()}
        </div>

      </div>
    </div>
  );
};

