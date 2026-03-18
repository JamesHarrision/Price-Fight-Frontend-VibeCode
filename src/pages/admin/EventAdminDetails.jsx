import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, addParticipantByAdmin, kickUser, getParticipants } from '../../services/eventService';
import { getItemsByEventId, updateItem, getInventoryItems } from '../../services/itemService';
import { getAllUsers } from '../../services/userService';
import {
  Users,
  Package,
  Plus,
  UserPlus,
  Search,
  ArrowLeft,
  X,
  Shield,
  Trash2,
  AlertCircle,
  ShieldAlert,
  Crown,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const EventAdminDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('participants');

  // Participants State
  const [participants, setParticipants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);

  // Items State
  const [eventItems, setEventItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);

  const loadData = async () => {
    try {
      const [evData, itemsData, participantsData] = await Promise.all([
        getEventById(eventId),
        getItemsByEventId(eventId),
        getParticipants(eventId)
      ]);
      setEvent(evData);
      setEventItems(itemsData.items || []);
      setParticipants(participantsData || []);
    } catch (err) {
      toast.error('Failed to load event data');
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  useEffect(() => {
    if (showAddItem) fetchInventory();
    if (showAddUser) fetchUsers();
  }, [showAddItem, showAddUser, userSearch]);

  const fetchInventory = async () => {
    setIsInventoryLoading(true);
    try {
      const result = await getInventoryItems(1, 100, '', '', true);
      setInventoryItems(result.items || []);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setIsInventoryLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await getAllUsers(1, 10, userSearch);
      setAllUsers(result.data || []);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  const handleAddUser = async (userId) => {
    try {
      await addParticipantByAdmin(eventId, userId);
      toast.success('User added to event');
      setShowAddUser(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to add user');
    }
  };

  const handleKickUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user from the arena?')) return;
    try {
      await kickUser(eventId, userId);
      toast.success('Participant removed');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to remove user');
    }
  };

  const handleAssignItem = async (itemId) => {
    try {
      await updateItem(itemId, { event_id: eventId });
      toast.success('Item assigned to event');
      setShowAddItem(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to assign item');
    }
  };

  if (!event) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
      <Loader2 className="w-10 h-10 animate-spin mb-4" />
      <p className="font-black uppercase tracking-widest text-[10px]">Synchronizing Arena Config...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Breadcrumb / Back */}
      <button
        onClick={() => navigate('/admin/events')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Arena Manager
      </button>

      {/* Event Header Card */}
      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden group">
        <div className="w-32 h-32 rounded-3xl bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0 z-10">
          <img
            src={event.cover_image || null}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            alt="event"
          />
          <div style={{ display: 'none' }} className="w-full h-full items-center justify-center bg-gray-100">
            <span className="text-4xl font-black text-gray-300">{event.title?.charAt(0)}</span>
          </div>
        </div>
        <div className="flex-1 z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black rounded-full border border-primary-100 uppercase tracking-tight italic">
              {event.status}
            </span>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
              ID: {event.id}
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2 uppercase italic">{event.title}</h1>
          <p className="text-gray-500 font-medium max-w-2xl leading-relaxed">{event.description}</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
      </div>

      {/* Management Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-100 px-2">
        <button
          onClick={() => setActiveTab('participants')}
          className={`pb-4 px-2 flex items-center gap-2 text-[10px] uppercase tracking-widest font-black transition-all border-b-2 
          ${activeTab === 'participants' ? 'border-gray-900 text-gray-900 scale-110' : 'border-transparent text-gray-300 hover:text-gray-500'}`}
        >
          <Users className="w-4 h-4" />
          Participants ({participants.length})
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-4 px-2 flex items-center gap-2 text-[10px] uppercase tracking-widest font-black transition-all border-b-2 
          ${activeTab === 'items' ? 'border-primary-600 text-primary-600 scale-110' : 'border-transparent text-gray-300 hover:text-gray-500'}`}
        >
          <Package className="w-4 h-4" />
          Catalog ({eventItems.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="py-2">
        {activeTab === 'participants' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">Registered Roster</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter italic">Total active contenders in this arena</p>
              </div>
              <button
                onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-900/20 hover:scale-105 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Invite Manually
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participants.map(p => (
                <div key={p.id} className="bg-white p-5 rounded-[32px] border border-gray-100 flex items-center gap-4 group hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-400 border border-gray-100 overflow-hidden">
                    {p.user.avatar_url ? (
                      <img src={p.user.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                    ) : p.user.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-black text-gray-900 truncate">{p.user.full_name}</p>
                      {p.user.role === 'ADMIN' && <Crown className="w-3 h-3 text-orange-400" />}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 truncate">{p.user.email}</p>
                  </div>
                  <button
                    onClick={() => handleKickUser(p.user_id)}
                    className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Remove Participant"
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {participants.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                  <Users className="w-10 h-10 text-gray-100 mx-auto mb-4" />
                  <p className="font-black text-gray-300 uppercase text-[10px] tracking-widest">Arena is empty. Invite contenders to begin.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">Arena Catalog</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter italic">Items undergoing liquidation in this cycle</p>
              </div>
              <button
                onClick={() => setShowAddItem(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                Assign New Asset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventItems.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center gap-5 group hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 relative overflow-hidden">
                  <div className="w-24 h-24 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0 z-10">
                    <img
                      src={item.primary_image || null}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt="item"
                    />
                    <div style={{ display: 'none' }} className="w-full h-full items-center justify-center bg-gray-100">
                      <span className="text-xl font-black text-gray-300">{item.name?.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 z-10">
                    <p className="font-black text-gray-900 truncate uppercase italic tracking-tight">{item.name}</p>
                    <p className="text-xs font-black text-primary-600 mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter leading-none mb-0.5">Starting</span>
                      ${Number(item.start_price).toLocaleString()}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[8px] font-black bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase text-gray-400">ID: {item.id.substring(0, 6)}</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (window.confirm('Eject this asset from current arena?')) {
                        try {
                          await updateItem(item.id, { event_id: null });
                          toast.success('Asset ejected');
                          loadData();
                        } catch (err) { toast.error('Ejection failed'); }
                      }
                    }}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-10"
                    title="De-assign Item"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                </div>
              ))}
              {eventItems.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                  <Package className="w-10 h-10 text-gray-100 mx-auto mb-4" />
                  <p className="font-black text-gray-300 uppercase text-[10px] tracking-widest">Catalog is empty. Assign items from inventory.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {(showAddUser || showAddItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 italic uppercase tracking-tighter">
                  {showAddUser ? 'CONTENDER SCAN' : 'ASSET DEPLOYMENT'}
                </h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manual {showAddUser ? 'Authorization' : 'Allocation'}</p>
              </div>
              <button
                onClick={() => { setShowAddUser(false); setShowAddItem(false); setUserSearch(''); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {showAddUser ? (
                <div className="space-y-6">
                  <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-black transition-all" />
                    <input
                      type="text"
                      placeholder="SEARCH CONTENDERS..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-gray-950/5"
                    />
                  </div>
                  <div className="space-y-3">
                    {allUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-5 rounded-3xl bg-gray-50 border border-transparent hover:border-gray-200 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center font-black text-gray-400 border border-gray-100 overflow-hidden">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                            ) : user.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{user.full_name}</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{user.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddUser(user.id)}
                          className="px-4 py-2 bg-white text-gray-900 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-all"
                        >
                          Authorize
                        </button>
                      </div>
                    ))}
                    {allUsers.length === 0 && <p className="text-center text-gray-300 font-black uppercase text-[10px] py-10 tracking-widest">No matching conteders found.</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {inventoryItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-5 rounded-3xl bg-gray-50 border border-transparent hover:border-gray-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden border border-gray-100 flex-shrink-0">
                          <img
                            src={item.primary_image || null}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt="item"
                          />
                          <div style={{ display: 'none' }} className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-lg font-black text-gray-300">{item.name?.charAt(0)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-900 uppercase tracking-tighter italic">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${item.status === 'UNSOLD' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-500 border border-green-100'
                              }`}>
                              {item.status}
                            </span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase italic">${Number(item.start_price).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignItem(item.id)}
                        className="px-4 py-2 bg-white text-gray-500 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all"
                      >
                        Deploy
                      </button>
                    </div>
                  ))}
                  {inventoryItems.length === 0 && <p className="text-center text-gray-300 font-black uppercase text-[10px] py-10 tracking-widest">Inventory exhausted. Register new assets.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f3f4f6; border-radius: 10px; }
      `}} />
    </div>
  );
};
