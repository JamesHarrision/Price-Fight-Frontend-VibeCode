import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInventoryItems, updateItem, createItem } from '../../services/itemService';
import {
  Plus,
  Upload,
  Package,
  Search,
  Filter,
  Tag,
  DollarSign,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Archive,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ItemManager = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_price: '',
    step_price: ''
  });

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    start_price: '',
    step_price: '',
    description: '',
    images: [] // Will hold an array of file objects
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const result = await getInventoryItems(page, 10, search, statusFilter);
      setItems(result.items || []);
      setTotalPages(Math.ceil((result.total || 0) / 10));
    } catch (err) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('name', createFormData.name);
    data.append('start_price', createFormData.start_price);
    data.append('step_price', createFormData.step_price);
    data.append('description', createFormData.description);

    if (createFormData.images && createFormData.images.length > 0) {
      // Loop through the array of files and append each to 'images' field
      createFormData.images.forEach(file => {
        data.append('images', file);
      });
    }

    try {
      await createItem(data);
      toast.success('New asset registered in vault');
      setIsCreateModalOpen(false);
      setCreateFormData({ name: '', start_price: '', step_price: '', description: '', images: [] });
      fetchItems();
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      start_price: item.start_price,
      step_price: item.step_price
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateItem(editingItem.id, formData);
      toast.success('Asset updated successfully');
      setIsEditModalOpen(false);
      fetchItems();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, search, statusFilter]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'WAITING': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'LIVE': return 'bg-green-50 text-green-600 border-green-100';
      case 'SOLD': return 'bg-gray-50 text-gray-500 border-gray-100';
      case 'UNSOLD': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Asset Inventory</h1>
          <p className="text-gray-500 font-medium">Global management of all auctionable items.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-4 bg-primary-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            Register Asset
          </button>
          <div className="w-px h-8 bg-gray-200 mx-2 hidden md:block"></div>
          <div className="flex items-center gap-2">
            {['', 'WAITING', 'LIVE', 'SOLD', 'UNSOLD'].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-4 py-2 text-[10px] font-black rounded-xl border transition-all 
                ${statusFilter === s ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}
              >
                {s || 'ALL ASSETS'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
            <input
              type="text"
              placeholder="SEARCH BY ASSET NAME OR SKU..."
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
            <span className="text-[10px] font-black text-gray-400 px-4 uppercase tracking-widest">Archive {page} / {totalPages}</span>
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
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valuation</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lifecycle</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Deployment</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-8 py-10 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : items.length > 0 ? (
                items.map(item => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                          <img
                            src={item.primary_image || null}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            className="w-full h-full object-cover"
                            alt="asset"
                          />
                          <div style={{ display: 'none' }} className="w-full h-full items-center justify-center bg-gray-100">
                            <span className="text-2xl font-black text-gray-300">{item.name?.charAt(0)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-black text-gray-900 leading-tight uppercase tracking-tight italic">{item.name}</p>
                          <p className="text-[10px] font-bold text-gray-300 flex items-center gap-1.5 mt-1">
                            ID: {item.id.substring(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-gray-900">${Number(item.start_price).toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Starting Bid</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 text-[10px] font-black rounded-full border uppercase tracking-widest ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {item.event_id ? (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-primary-600 uppercase italic">Deployed in Arena</p>
                          <p className="text-[8px] font-bold text-gray-400 truncate max-w-[120px]">{item.event_id}</p>
                        </div>
                      ) : (
                        <p className="text-[10px] font-black text-gray-300 uppercase italic">In Storage</p>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/items/${item.id}`)}
                          className="p-3 text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"
                          title="View Archive"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-3 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
                          title="Edit Specs"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
                      <Archive className="w-10 h-10 text-gray-200" />
                    </div>
                    <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Vault is empty. Register new assets.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <form onSubmit={handleUpdateItem}>
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 italic uppercase">Re-Spec Asset</h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">ID: {editingItem.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <XCircle className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] font-bold text-gray-900 focus:ring-2 focus:ring-gray-900/5 italic"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Price</label>
                    <input
                      required
                      type="number"
                      value={formData.start_price}
                      onChange={(e) => setFormData({ ...formData, start_price: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] font-bold text-gray-900 focus:ring-2 focus:ring-gray-900/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bid Step</label>
                    <input
                      required
                      type="number"
                      value={formData.step_price}
                      onChange={(e) => setFormData({ ...formData, step_price: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] font-bold text-gray-900 focus:ring-2 focus:ring-gray-900/5"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50/50 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 text-gray-400 font-black text-[10px] uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="px-10 py-4 bg-gray-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gray-900/20 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save Specs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <form onSubmit={handleCreateItem}>
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 italic uppercase">Register Asset</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Add new item to global vault</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <XCircle className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Identity</label>
                  <input
                    required
                    type="text"
                    placeholder="E.G. ROLEX SUBMARINER 2024"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/10 italic"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Brief Intelligence</label>
                  <textarea
                    rows="3"
                    placeholder="SPECIFICATIONS, CONDITION, PROVENANCE..."
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] font-medium text-gray-600 focus:ring-2 focus:ring-primary-500/10 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Starting Price</label>
                    <input
                      required
                      type="number"
                      value={createFormData.start_price}
                      onChange={(e) => setCreateFormData({ ...createFormData, start_price: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Increment Step</label>
                    <input
                      required
                      type="number"
                      value={createFormData.step_price}
                      onChange={(e) => setCreateFormData({ ...createFormData, step_price: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visual Asset (Single)</label>
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setCreateFormData({ ...createFormData, images: Array.from(e.target.files) })}
                      className="hidden"
                      id="asset-upload"
                    />
                    <label
                      htmlFor="asset-upload"
                      className="flex items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed border-gray-100 rounded-[32px] hover:bg-gray-50 hover:border-primary-100 transition-all cursor-pointer group"
                    >
                      <Upload className="w-5 h-5 text-gray-300 group-hover:text-primary-600 group-hover:-translate-y-1 transition-all" />
                      <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-900 tracking-widest uppercase">
                        {createFormData.images.length > 0
                          ? `${createFormData.images.length} Captured Assets`
                          : 'Click to Upload Capture(s)'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50/50 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-3 text-gray-400 font-black text-[10px] uppercase tracking-widest"
                >
                  Abort
                </button>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="px-10 py-5 bg-gray-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gray-900/20 flex items-center gap-3 active:scale-95 transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Finalize Records
                </button>
              </div>
            </form>
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
