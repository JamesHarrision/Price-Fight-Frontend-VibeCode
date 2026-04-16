import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItemDetail, placeBid } from '../services/itemService';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, History, Trophy, Clock, ImageOff, ShieldCheck, Zap } from 'lucide-react';
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
  const [priceFlash, setPriceFlash] = useState(false);
  const [bidCount, setBidCount] = useState(0);
  const prevPriceRef = useRef(null);

  useEffect(() => {
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
    fetchItemInfo();
  }, [itemId]);

  useEffect(() => {
    if (!item?.event_id) return;
    const itemRef = ref(rtdb, `events/${item.event_id}/items/${itemId}`);
    const unsubscribe = onValue(itemRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (prevPriceRef.current !== null && data.current_price !== prevPriceRef.current) {
          setPriceFlash(true);
          setTimeout(() => setPriceFlash(false), 1200);
        }
        prevPriceRef.current = data.current_price;
        setItem(prev => {
          const bidsArray = data.bids
            ? Object.values(data.bids).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
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
      loading: 'Đang gửi giá...',
      success: '🎉 Trả giá thành công! Bạn đang dẫn đầu!',
      error: (err) => err.message || 'Lỗi khi đặt giá.'
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>
  );

  const currentPrice = parseFloat(item?.current_price || item?.start_price);
  const minBid = currentPrice + parseFloat(item?.step_price);
  const totalBids = bidCount;
  const isLeading = item?.highest_bidder_id === user?.id;
  const isLive = item?.status === 'LIVE';

  // --- DARK THEME (LIVE) ---
  if (isLive) {
    return (
      <div className="min-h-screen bg-[var(--color-navy-900)] text-white font-sans selection:bg-primary-500/30">
        <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-[var(--color-navy-950)]">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="font-bold text-lg tracking-wide uppercase">Phòng Đấu Giá</span>
              <span className="text-xs text-white/40 ml-4 hidden md:inline">ID: #AUK{item?.id?.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Trực tiếp</span>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Top section: Image left, Summary Right */}
            <div className="md:col-span-6 flex justify-center items-center bg-[var(--color-navy-950)] rounded-3xl p-8 border border-white/5 relative group perspective-1000">
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black uppercase px-2 py-1 rounded shadow-lg flex items-center gap-1 z-10 w-fit">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> LIVE
              </div>
              {item?.primary_image ? (
                <img src={item.primary_image} alt={item?.name} className="max-w-full h-auto max-h-[350px] object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <ImageOff className="w-32 h-32 text-white/10" />
              )}
              <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[var(--color-navy-950)] to-transparent opacity-50 rounded-b-3xl"></div>
            </div>

            <div className="md:col-span-6 flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-bold mb-8 leading-tight">{item?.name}</h1>
              <div className="space-y-6">
                <div>
                  <p className="text-white/40 text-sm font-medium mb-1">Giá hiện tại</p>
                  <p className={`text-4xl lg:text-5xl font-black text-primary-400 transition-all duration-300 ${priceFlash ? 'scale-105 text-white' : ''}`}>
                    {currentPrice.toLocaleString()} đ
                  </p>
                </div>
                <div className="flex items-center gap-12 border-t border-white/10 pt-6">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Bước giá</p>
                    <p className="text-lg font-bold">{parseFloat(item?.step_price).toLocaleString()} đ</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Thời gian còn lại</p>
                    <div className="flex items-center gap-2 font-black text-lg">
                      <div className="text-center"><span className="text-xl">00</span></div>:<div className="text-center"><span className="text-xl">15</span></div>:<div className="text-center"><span className="text-xl text-primary-400">36</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: History Left, Bid Right */}
            <div className="md:col-span-7">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                <History className="w-5 h-5 text-white/50" /> Lịch sử trả giá
              </h3>
              <div className="space-y-1">
                {item?.bids?.length > 0 ? item.bids.slice(0, 6).map((bid, i) => (
                  <div key={i} className={`flex justify-between items-center py-3 px-2 rounded-lg ${i === 0 ? 'bg-primary-500/10 border border-primary-500/20' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'}`}>
                        {(bid.full_name || 'U').substring(0, 1).toUpperCase()}
                      </div>
                      <span className="text-sm text-white/80">{bid.full_name || `Người dùng ${bid.user_id.substring(0,4)}`}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`font-bold ${i === 0 ? 'text-primary-400' : ''}`}>{parseFloat(bid.amount).toLocaleString()} đ</span>
                      <span className="text-white/30 text-xs w-12 text-right">{new Date(bid.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-6 text-white/30 text-sm">Chưa có lượt trả giá nào</p>
                )}
              </div>
            </div>

            <div className="md:col-span-5 bg-[var(--color-navy-950)] border border-white/10 rounded-3xl p-6 h-fit mt-8 md:mt-0 shadow-xl">
              <h3 className="text-white/80 font-bold mb-4">Đặt giá của bạn</h3>
              <form onSubmit={handleBid}>
                <div className="relative mb-3">
                  <input
                    type="number"
                    value={bidAmount}
                    min={minBid}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full bg-[var(--color-navy-900)] border border-white/10 rounded-xl py-4 px-4 text-white text-xl font-bold focus:outline-none focus:border-primary-500 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">đ</span>
                </div>
                <div className="flex justify-between text-xs text-white/40 mb-6 px-1">
                  <span>Bước giá: {parseFloat(item?.step_price).toLocaleString()} đ</span>
                  {isLeading && <span className="text-primary-400 font-bold">Bạn đang dẫn đầu</span>}
                </div>
                <button
                  type="submit"
                  disabled={placing}
                  className="w-full bg-primary-400 hover:bg-primary-500 text-gray-900 font-black py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)] disabled:opacity-50"
                >
                  {placing ? 'ĐANG ĐẶT...' : 'ĐẶT GIÁ'}
                </button>
              </form>
            </div>
            
          </div>
        </main>
      </div>
    );
  }

  // --- LIGHT THEME (PENDING/ENDED) ---
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        <div className="bg-gradient-to-b from-gray-100 to-white relative pt-8 pb-4 flex justify-center">
          <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-gray-400 hover:text-black">
             <ArrowLeft className="w-6 h-6" />
          </button>
          {item?.primary_image ? (
            <img src={item.primary_image} alt={item?.name} className="w-64 h-64 object-contain drop-shadow-xl" />
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-full flex items-center justify-center"><ImageOff className="w-12 h-12 text-gray-300" /></div>
          )}
        </div>

        <div className="p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-4">{item?.name}</h1>
          
          <div className="flex items-center gap-2 mb-6">
             <span className="px-2 py-0.5 bg-red-100 text-red-600 border border-red-200 text-[10px] font-black uppercase rounded">LIVE</span>
             <span className="text-sm font-bold text-gray-600">Sắp diễn ra</span>
          </div>

          <div className="flex justify-between items-center py-4 border-t border-gray-100">
            <span className="text-gray-500 text-sm">Thời gian bắt đầu</span>
            <span className="font-bold whitespace-pre text-right text-sm">
              {new Date(item?.start_time).toLocaleDateString('vi-VN')}
            </span>
          </div>

          <div className="flex justify-between items-center py-4 border-t border-gray-100">
            <span className="text-gray-500 text-sm">Giá khởi điểm</span>
            <span className="font-black text-xl text-gray-900">{parseFloat(item?.start_price).toLocaleString()} đ</span>
          </div>

          <div className="flex justify-between items-center py-4 border-t border-gray-100 mb-4">
            <span className="text-gray-500 text-sm">Số người quan tâm</span>
            <span className="font-bold text-sm">28</span>
          </div>

          <button 
            disabled className="w-full bg-primary-300 text-gray-900/50 py-4 rounded-xl font-black transition-colors"
          >
            Chưa bắt đầu
          </button>
        </div>
      </div>
    </div>
  );
};
