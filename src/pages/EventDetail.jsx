import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, joinEvent } from '../services/eventService';
import { getItemsByEventId } from '../services/itemService';
import { ArrowLeft, Users, Calendar, Gavel, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../config/firebase';

const ITEM_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1547996160-81dfa63595dd?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'
];

export const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await getEventById(eventId);
        setEvent(eventData);

        // Use items from event data if available (comes from DB)
        if (eventData.items) {
          setItems(eventData.items);
        } else {
          const itemsData = await getItemsByEventId(eventId);
          setItems(itemsData.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch event details", err);
        if (err.response?.status === 404) navigate('/404');
        if (err.response?.status === 403) navigate('/403');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, navigate]);

  // Firebase Listener - Only for ONGOING events
  useEffect(() => {
    if (!event || event.status !== 'ONGOING') return;

    const eventRef = ref(rtdb, `events/${eventId}`);
    const unsubscribe = onValue(eventRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.items) {
        setItems(prevItems => {
          return prevItems.map(item => {
            const liveItem = data.items[item.id];
            if (liveItem) {
              return {
                ...item,
                current_price: liveItem.current_price || item.current_price,
                status: liveItem.status || item.status
              };
            }
            return item;
          });
        });

        // Also update event status if it changes in RTDB
        setEvent(prevEvent => ({
          ...prevEvent,
          status: data.status || prevEvent?.status
        }));
      }
    });

    return () => unsubscribe();
  }, [event?.status, eventId]);

  const handleJoin = async () => {
    if (joining || isJoined) return;

    setJoining(true);
    const joinPromise = joinEvent(eventId);

    toast.promise(joinPromise, {
      loading: 'Enrolling you in the auction...',
      success: () => {
        setIsJoined(true);
        return 'Welcome to the arena! You are now a participant.';
      },
      error: (err) => {
        const message = err.message || 'Failed to join auction';

        // Handle specific "Already Joined" case from backend
        if (message.includes('tham gia sự kiện này rồi') || err.response?.status === 400) {
          setIsJoined(true);
          return 'You are already a participant in this event!';
        }

        return message;
      }
    });

    try {
      await joinPromise;
    } catch (err) {
      console.error("Join failed", err);
    } finally {
      setJoining(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header / Hero */}
      <div className="relative h-80 w-full overflow-hidden">
        <img
          src={event?.cover_image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200'}
          className="w-full h-full object-cover brightness-[0.4]"
          alt="Banner"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="absolute top-8 left-8 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all border border-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary-600 text-white text-xs font-black rounded-full uppercase tracking-widest">{event?.status}</span>
                <div className="flex items-center text-gray-300 text-sm font-bold gap-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(event?.start_time).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {event?._count?.participants || 0} joined
                  </div>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">{event?.title}</h1>
              <p className="text-gray-300 max-w-2xl font-medium line-clamp-2 italic">"{event?.description}"</p>
            </div>

            <div className="flex-shrink-0">
              {isJoined ? (
                <div className="flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-green-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                  PARTICIPATING
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="flex items-center gap-2 bg-white text-gray-900 px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                >
                  {joining ? 'JOINING...' : 'JOIN AUCTION'}
                  <Users className="w-6 h-6 text-primary-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-10 pb-4 border-b border-gray-100">
          <Gavel className="w-8 h-8 text-primary-600" />
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Vat pham dang dau gia</h2>
          <span className="ml-2 px-3 py-1 bg-gray-200 text-gray-600 text-sm font-bold rounded-full">{items?.length || 0}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items?.map(item => (
            <div
              key={item.id}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
            >
              <div className="relative h-60 overflow-hidden">
                <img
                  src={item.primary_image || ITEM_PLACEHOLDERS[item.id.charCodeAt(0) % ITEM_PLACEHOLDERS.length]}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black tracking-widest text-gray-900 shadow-sm">
                    {item.status}
                  </div>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">{item.name}</h3>
                <p className="text-gray-400 text-sm font-medium mb-6 line-clamp-2 h-10">{item.description || 'No detailed description.'}</p>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Price</p>
                    <p className="text-xl font-black text-primary-600 tracking-tight">
                      ${parseFloat(item.current_price || item.start_price).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/items/${item.id}`)}
                    className="p-3 bg-gray-50 text-gray-900 rounded-2xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">He thong dang cap nhat vat pham...</p>
          </div>
        )}
      </main>
    </div>
  );
};
