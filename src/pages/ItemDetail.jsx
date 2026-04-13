import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItemDetail, placeBid } from '../services/itemService';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Gavel, History, Info, DollarSign, Timer, ImageOff, TrendingUp, Users, Crown, Shield, Zap, Trophy, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../config/firebase';

export const ItemDetail = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [placing, setPlacing] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [priceFlash, setPriceFlash] = useState(false);
  const [bidCount, setBidCount] = useState(0);
  const prevPriceRef = useRef(null);

  const fetchItemInfo = async () => {
    try {
      const data = await getItemDetail(itemId);
      setItem(data);
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
        // Hiệu ứng flash khi giá thay đổi
        if (prevPriceRef.current !== null && data.current_price !== prevPriceRef.current) {
          setPriceFlash(true);
          setTimeout(() => setPriceFlash(false), 1200);
        }
        prevPriceRef.current = data.current_price;

        setItem(prev => {
          const bidsArray = data.bids
            ? Object.values(data.bids)
              .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            : [];

          setBidCount(bidsArray.length);

          return {
            ...prev,
            current_price: data.current_price,
            highest_bidder_id: data.highest_bidder_id,
            bids: bidsArray
          };
        });

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
      success: '🎉 Bid placed! You are now in the lead!',
      error: (err) => err.message || 'Failed to place bid.'
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
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-indigo-950">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
        <p className="text-white/50 font-bold text-sm uppercase tracking-widest">Loading auction...</p>
      </div>
    </div>
  );

  const currentPrice = parseFloat(item?.current_price || item?.start_price);
  const minBid = currentPrice + parseFloat(item?.step_price);
  const totalBids = bidCount;
  const isLeading = item?.highest_bidder_id === user?.id;
  const priceIncrease = currentPrice - parseFloat(item?.start_price);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-indigo-950">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold hidden sm:inline">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${item?.status === 'LIVE' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-white/80 text-sm font-black uppercase tracking-widest">{item?.status === 'LIVE' ? 'Live Auction' : item?.status}</span>
        </div>
        <Link to="/" className="text-white/40 hover:text-white text-sm font-bold transition-colors">
          <Trophy className="w-5 h-5" />
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* =================== LEFT COLUMN: Image + Tabs =================== */}
          <div className="lg:col-span-7 space-y-6">

            {/* Image Gallery */}
            <div className="bg-white/5 backdrop-blur-md p-3 rounded-[28px] border border-white/10 shadow-2xl">
              <div className="aspect-[4/3] rounded-[20px] overflow-hidden bg-gray-800 relative">
                {item?.primary_image ? (
                  <img
                    src={item.primary_image}
                    className="w-full h-full object-cover"
                    alt={item?.name}
                    onError={(e) => { e.target.style.display = 'none'; if(e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className={`w-full h-full flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 ${item?.primary_image ? 'hidden' : 'flex'} absolute inset-0`}>
                  <ImageOff className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-lg font-black text-gray-500">No Image Available</p>
                  <p className="text-sm text-gray-600 font-medium mt-1">The seller has not uploaded a photo yet.</p>
                </div>
                {/* Overlay gradient */}
                <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <h1 className="text-2xl font-black text-white drop-shadow-lg leading-tight">{item?.name}</h1>
                </div>
              </div>
            </div>

            {/* Tabs: Details / Bid History */}
            <div className="bg-white/5 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden">
              <div className="flex border-b border-white/5">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'info' ? 'text-primary-400 border-b-2 border-primary-400 bg-white/5' : 'text-white/40 hover:text-white/60'}`}
                >
                  <Info className="w-4 h-4" />
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'history' ? 'text-primary-400 border-b-2 border-primary-400 bg-white/5' : 'text-white/40 hover:text-white/60'}`}
                >
                  <History className="w-4 h-4" />
                  Bid History
                  {totalBids > 0 && (
                    <span className="bg-primary-500/20 text-primary-400 text-[10px] font-black px-2 py-0.5 rounded-full">{totalBids}</span>
                  )}
                </button>
              </div>

              <div className="p-6 min-h-[350px]">
                {activeTab === 'info' ? (
                  <div>
                    <div className="flex gap-3 mb-6 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                        <Zap className="w-3 h-3" /> Live
                      </span>
                    </div>
                    <p className="text-white/60 font-medium leading-relaxed text-[15px]">
                      {item?.description || 'No detailed description provided for this item.'}
                    </p>
                  </div>
                ) : (
                  <div>
                    {item?.bids?.length > 0 ? (
                      <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                        {item.bids.slice(0, 5).map((bid, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500
                              ${i === 0
                                ? `bg-gradient-to-r from-primary-500/20 to-purple-500/20 border-primary-500/30 shadow-lg shadow-primary-500/10 ${priceFlash ? 'ring-2 ring-primary-400 animate-pulse' : ''}`
                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                                ${i === 0 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white/10 text-white/60'}`}
                              >
                                {i === 0 ? <Crown className="w-5 h-5" /> : <span>{(bid.full_name || 'U').substring(0, 1).toUpperCase()}</span>}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-bold truncate ${i === 0 ? 'text-white' : 'text-white/70'}`}>
                                  {bid.full_name || `Bidder #${(bid.user_id || '').substring(0, 5)}`}
                                </p>
                                <p className="text-[10px] text-white/30 font-bold">
                                  {new Date(bid.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-lg font-black tracking-tight ${i === 0 ? 'text-primary-400' : 'text-white/80'}`}>
                                ${parseFloat(bid.amount).toLocaleString()}
                              </p>
                              {i === 0 && (
                                <span className="text-[9px] bg-primary-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                  Leading
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {item.bids.length > 5 && (
                          <div className="text-center py-3">
                            <span className="text-xs text-white/30 font-bold bg-white/5 px-4 py-1.5 rounded-full">
                              + {item.bids.length - 5} earlier bid(s)
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                          <Gavel className="w-10 h-10 text-white/20" />
                        </div>
                        <p className="font-black text-white/40 text-sm">No bids yet!</p>
                        <p className="text-xs text-white/20 font-medium mt-1">Be the first to place a bid on this item.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================== RIGHT COLUMN: Bidding Panel =================== */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">

              {/* Main Price Card */}
              <div className="relative overflow-hidden rounded-[32px] shadow-2xl shadow-primary-900/30">
                {/* Animated bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-[100px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full blur-[80px] opacity-15"></div>

                <div className="relative z-10 p-8">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${item?.status === 'LIVE' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                      <span className="text-white/80 text-xs font-black uppercase tracking-widest">{item?.status}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/10">
                      <Users className="w-3.5 h-3.5 text-indigo-300" />
                      <span className="text-xs font-black text-indigo-200">{totalBids} bids</span>
                    </div>
                  </div>

                  {/* Price Display - Hero */}
                  <div className="mb-2">
                    <p className="text-indigo-300/80 font-black uppercase tracking-widest text-[10px] mb-3">Current Highest Bid</p>
                    <div className={`transition-all duration-700 ${priceFlash ? 'scale-110 origin-left' : 'scale-100'}`}>
                      <span className={`text-[56px] font-black tracking-tighter leading-none transition-colors duration-500 ${priceFlash ? 'text-yellow-300' : 'text-white'}`}>
                        ${currentPrice.toLocaleString()}
                      </span>
                    </div>
                    {priceFlash && (
                      <div className="flex items-center gap-1.5 mt-3 animate-bounce">
                        <ChevronUp className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300 text-[10px] font-black uppercase tracking-widest">New bid received!</span>
                      </div>
                    )}
                    {!priceFlash && priceIncrease > 0 && (
                      <div className="flex items-center gap-1.5 mt-3">
                        <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400/70 text-[10px] font-bold">+${priceIncrease.toLocaleString()} from start</span>
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 my-8">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                      <p className="text-indigo-400/80 text-[9px] font-black uppercase tracking-widest mb-1">Start Price</p>
                      <p className="text-lg font-black text-white">${parseFloat(item?.start_price).toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                      <p className="text-indigo-400/80 text-[9px] font-black uppercase tracking-widest mb-1">Min Step</p>
                      <p className="text-lg font-black text-white">+${parseFloat(item?.step_price).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Leading Status Banner */}
                  {totalBids > 0 && (
                    <div className={`mb-6 p-4 rounded-2xl border text-center transition-all duration-500 ${isLeading
                        ? 'bg-green-500/15 border-green-400/20'
                        : 'bg-red-500/15 border-red-400/20'
                      }`}>
                      <p className={`text-sm font-black uppercase tracking-widest ${isLeading ? 'text-green-300' : 'text-red-300'}`}>
                        {isLeading ? '🏆 You are leading!' : '⚡ You have been outbid!'}
                      </p>
                    </div>
                  )}

                  {/* Bid Form */}
                  <form onSubmit={handleBid} className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/40 group-focus-within:text-white transition-colors">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <input
                        type="number"
                        value={bidAmount}
                        min={minBid}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full bg-white/10 border-2 border-white/10 rounded-2xl py-5 pl-14 pr-4 text-white text-xl font-black placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 focus:bg-white/15 transition-all"
                        placeholder={`Min bid $${minBid}`}
                      />
                      <p className="mt-2 text-[10px] text-indigo-300/60 font-bold ml-1">Minimum: ${minBid.toLocaleString()}</p>
                    </div>

                    <button
                      type="submit"
                      disabled={placing || item?.status !== 'LIVE'}
                      className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 transform active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {placing ? 'PLACING BID...' : 'PLACE BID NOW'}
                        {!placing && <Gavel className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                  </form>
                </div>
              </div>

              {/* Wallet Card */}
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-[28px] border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/20">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Your Wallet</p>
                    <p className="text-xl font-black text-white leading-none">${parseFloat(user?.balance || 0).toLocaleString()}</p>
                  </div>
                </div>
                <button className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-white/30 font-bold hover:border-primary-500/50 hover:text-primary-400 transition-all text-sm">
                  + Deposit funds
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
