import React, { useState, useEffect } from 'react';
import { getAllEvents, deleteEvent, createEvent, updateEvent } from '../../services/eventService';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Package,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const EventManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    cover_image: null
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const result = await getAllEvents(1, 50, statusFilter);
      setEvents(result.allEvents || result.data?.data || []);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also remove associated items!')) return;

    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (err) {
      toast.error(err.message || 'Failed to delete event');
    }
  };

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        start_time: new Date(event.start_time).toISOString().slice(0, 16),
        end_time: new Date(event.end_time).toISOString().slice(0, 16),
        cover_image: null
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        cover_image: null
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('start_time', formData.start_time);
      data.append('end_time', formData.end_time);
      if (formData.cover_image) {
        data.append('cover_image', formData.cover_image);
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, data);
        toast.success('Event updated successfully');
      } else {
        await createEvent(data);
        toast.success('Event created successfully');
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'ONGOING': return 'bg-green-100 text-green-600 border-green-200';
      case 'ENDED': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Events Arena</h1>
          <p className="text-gray-500 font-medium">Manage all auction events and their lifecycles.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary-500/20 hover:scale-[1.02] transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create New Event
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Events', val: events.length, icon: Calendar, color: 'primary' },
          { label: 'Active Now', val: events.filter(e => e.status === 'ONGOING').length, icon: TrendingUp, color: 'green' },
          { label: 'Upcoming', val: events.filter(e => e.status === 'PENDING').length, icon: Clock, color: 'orange' },
          { label: 'Completed', val: events.filter(e => e.status === 'ENDED').length, icon: CheckCircle2, color: 'gray' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color === 'primary' ? 'blue' : stat.color}-50 flex items-center justify-center text-${stat.color === 'primary' ? 'blue' : stat.color}-600 mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Filters & Table Shell */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 mr-2" />
            {['', 'PENDING', 'ONGOING', 'ENDED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 text-[10px] font-black rounded-xl border transition-all 
                ${statusFilter === s ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'} `}
              >
                {s || 'ALL'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timing</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Items</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-8 py-10 h-24 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <Link to={`/admin/events/${event.id}`} className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                          <img src={event.cover_image || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 leading-tight mb-1 truncate group-hover:text-primary-600 transition-colors uppercase italic">{event.title}</p>
                          <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                            ID: {event.id.substring(0, 8)}...
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-gray-600">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {new Date(event.start_time).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase italic">
                          Starts {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-900">
                          {event._count?.items || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-tight ${getStatusStyle(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(event)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                          title="Edit Metadata"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Event"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                      <AlertCircle className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="font-bold text-gray-400">No events found matching your criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-8">
            <form onSubmit={handleSubmit}>
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {editingEvent ? 'Modifier Arena' : 'New Launch'}
                  </h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Status: {editingEvent ? editingEvent.status : 'INITIALIZING'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Arena Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. ULTRA LUXURY CHRONO"
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 italic"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lift Off (Start)</label>
                    <input
                      required
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Touch Down (End)</label>
                    <input
                      required
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mission Briefing</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell the story of this event..."
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visual Banner</label>
                  <div className="relative h-44 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 group hover:border-primary-500/50 transition-colors overflow-hidden">
                    {formData.cover_image ? (
                      <img src={URL.createObjectURL(formData.cover_image)} className="absolute inset-0 w-full h-full object-cover" alt="preview" />
                    ) : editingEvent?.cover_image ? (
                      <div className="relative w-full h-full">
                        <img src={editingEvent.cover_image} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="current" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
                          <p className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">Drop new image to replace</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-primary-600 transition-all duration-500 group-hover:scale-110" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Maximum Impact Assets Only</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, cover_image: e.target.files[0] })}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50/50 flex flex-col md:flex-row items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full md:w-auto px-8 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-colors"
                >
                  Abort Mission
                </button>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full md:w-auto px-12 py-4 bg-gray-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-gray-900/30 hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 group-hover:animate-bounce" />
                  )}
                  {editingEvent ? 'Execute Update' : 'Initialize Arena'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
};
