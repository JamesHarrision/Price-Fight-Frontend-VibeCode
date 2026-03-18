import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItemDetail, placeBid } from '../services/itemService';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Gavel, History, Info, AlertCircle, CheckCircle2, DollarSign, Timer } from 'lucide-react';
import toast from 'react-hot-toast';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../config/firebase';

const ITEM_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1547996160-81dfa63595dd?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'
];

export const ItemDetail = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [placing, setPlacing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const fetchItemInfo = async () => {
    try {
      const data = await getItemDetail(itemId);
      setItem(data);
      // Pre-fill next valid bid
      const nextBid = parseFloat(data.current_price || data.start_price) + parseFloat(data.step_price);
      setBidAmount(nextBid.toString());
    } catch (err) {
      console.error("Failed to fetch item", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemInfo();
  }, [itemId]);

  // Firebase Realtime Listener
  useEffect(() => {
    if (!item?.event_id) return;

    const itemRef = ref(rtdb, `events/${item.event_id}/items/${itemId}`);

    const unsubscribe = onValue(itemRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setItem(prev => {
          // Convert bids object to array and sort by time asc (Oldest First)
          // Limit to the 10 latest bids
          const bidsArray = data.bids
            ? Object.values(data.bids)
              .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
              .slice(-10)
            : [];

          return {
            ...prev,
            current_price: data.current_price,
            highest_bidder_id: data.highest_bidder_id,
            bids: bidsArray
          };
        });

        // Update bid amount suggestion if current price changes
        const currentPrice = parseFloat(data.current_price || item.start_price);
        const nextBid = currentPrice + parseFloat(item.step_price);
        setBidAmount(nextBid.toString());
      }
    });

    return () => unsubscribe();
  }, [item?.event_id, itemId]);

  const handleBid = async (e) => {
    e.preventDefault();
    if (!bidAmount || isNaN(bidAmount)) return;

    setPlacing(true);
    const bidPromise = placeBid(item.event_id, itemId, parseFloat(bidAmount));

    toast.promise(bidPromise, {
      loading: 'Submitting your bid...',
      success: 'Bid placed successfully! You are current leader.',
      error: (err) => err.message || 'Failed to place bid. Ensure your bid is high enough.'
    });

    try {
      await bidPromise;
    } catch (err) {
      console.error("Bid failed", err);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  const currentPrice = parseFloat(item?.current_price || item?.start_price);
  const minBid = currentPrice + parseFloat(item?.step_price);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-600"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-gray-900">Bid Item Details</h1>
        <div className="w-10"></div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left: Image & Description */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50">
                <img
                  src={item?.primary_image || ITEM_PLACEHOLDERS[itemId.charCodeAt(0) % ITEM_PLACEHOLDERS.length]}
                  className="w-full h-full object-contain"
                  alt={item?.name}
                />
              </div>
              {item?.images && item.images.length > 0 && (
                <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                  {item.images.map((img, i) => (
                    <div key={i} className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100">
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-50">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'info' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Info className="w-4 h-4" />
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'history' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <History className="w-4 h-4" />
                  Bid History
                </button>
              </div>

              <div className="p-8 min-h-[300px]">
                {activeTab === 'info' ? (
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4">{item?.name}</h2>
                    <div className="prose prose-indigo max-w-none text-gray-500 font-medium leading-relaxed">
                      {item?.description || 'No detailed description provided for this item.'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {item?.bids?.length > 0 ? (
                      item.bids.map((bid, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm text-primary-600 font-bold">
                              {(bid.user_id || 'U').substring(0, 1)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">Bidder #{bid.user_id.substring(0, 5)}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(bid.time).toLocaleTimeString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-gray-900 tracking-tight">${parseFloat(bid.amount).toLocaleString()}</p>
                            {i === item.bids.length - 1 && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-black">LATEST</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 opacity-40">
                        <Gavel className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-bold">No bids yet!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Bidding Controls */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-200">
                <div className="flex justify-between items-center mb-8">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-black tracking-widest">{item?.status}</span>
                  <div className="flex items-center gap-2 text-indigo-300">
                    <Timer className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-tight italic">Live auction</span>
                  </div>
                </div>

                <div className="mb-10">
                  <p className="text-indigo-300 font-black uppercase tracking-widest text-[10px] mb-2 opacity-80">Current Highest Bid</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tighter">${currentPrice.toLocaleString()}</span>
                    <span className="text-indigo-400 font-bold">USD</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-indigo-400 text-[10px] font-black uppercase mb-1">Start Price</p>
                    <p className="text-lg font-black">${parseFloat(item?.start_price).toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-indigo-400 text-[10px] font-black uppercase mb-1">Step Bonus</p>
                    <p className="text-lg font-black">+${parseFloat(item?.step_price).toLocaleString()}</p>
                  </div>
                </div>

                <form onSubmit={handleBid} className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-white transition-colors">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <input
                      type="number"
                      value={bidAmount}
                      min={minBid}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
                      placeholder={`Min bid ${minBid}`}
                    />
                    <p className="mt-2 text-[10px] text-indigo-300 font-bold ml-1 italic">You must bid at least ${minBid.toLocaleString()}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={placing || item?.status !== 'LIVE'}
                    className="w-full bg-white text-indigo-900 py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-gray-100 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {placing ? 'PLACING BID...' : 'PLACE BID NOW'}
                    {!placing && <Gavel className="inline-block ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />}
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Your Wallet</p>
                    <p className="text-xl font-black text-gray-900 leading-none">${parseFloat(user?.balance || 0).toLocaleString()}</p>
                  </div>
                </div>
                <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-primary-500 hover:text-primary-600 transition-all text-sm">
                  + Deposit funds to bid
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
