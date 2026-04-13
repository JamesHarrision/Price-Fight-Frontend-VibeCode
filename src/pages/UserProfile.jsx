import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, getAddresses, addAddress, deleteAddress } from '../services/userService';
import toast from 'react-hot-toast';
import { User, MapPin, Plus, Trash2, Camera, ArrowLeft, Loader2, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserProfile = () => {
  const { user, refreshUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile logic
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef(null);

  // Address Modal logic
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ phone: '', street: '', city: '', is_default: false });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (err) {
      toast.error('Failed to load address book');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) return toast.error('Name cannot be empty');
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('full_name', fullName);
      if (avatarFile) {
        formData.append('avatar_url', avatarFile);
      }
      await updateProfile(formData);
      await refreshUser(); // Cập nhật lại Auth Context
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.phone || !newAddress.street || !newAddress.city) {
      return toast.error('Please fill out all address fields');
    }
    setSavingAddress(true);
    try {
      await addAddress(newAddress);
      toast.success('Address added');
      setShowAddressModal(false);
      setNewAddress({ phone: '', street: '', city: '', is_default: false });
      fetchAddresses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await deleteAddress(id);
      toast.success('Address deleted');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Navbar Minimal */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold">Back to Dashboard</span>
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">My Profile</h1>
          <p className="text-gray-500 font-medium">Manage your personal information and delivery addresses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột trái: Identity Form */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Identity</h2>
              
              <div className="flex flex-col items-center mb-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 hover:opacity-90 transition-opacity flex items-center justify-center relative">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
                <p className="text-xs text-gray-400 font-medium mt-4">Click to change avatar</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 placeholder:text-gray-400 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                  <input
                    type="text"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mt-6 text-center">
                   <p className="text-[10px] font-bold text-primary-400 uppercase mb-1 tracking-widest">Available Balance</p>
                   <p className="text-2xl font-black text-primary-700">${parseFloat(user?.balance || 0).toLocaleString()}</p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="w-full mt-6 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white font-bold py-3 px-4 rounded-xl shadow-xl shadow-gray-900/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Cột phải: Address Book */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Address Book</h2>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700 rounded-lg text-xs font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No saved addresses yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className="relative group border border-gray-100 p-5 rounded-2xl hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all bg-white">
                      {addr.is_default && (
                         <span className="absolute -top-3 left-4 bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-primary-200">
                           Default
                         </span>
                      )}
                      <div className="flex justify-between items-start mb-2 mt-2">
                        <div className="flex items-center gap-2 text-gray-900 font-bold">
                          <MapPin className="w-4 h-4 text-primary-500" />
                          {addr.phone}
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">{addr.street}</p>
                      <p className="text-sm text-gray-500 font-medium">{addr.city}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-900 mb-6">Add Delivery Address</h3>
            <form onSubmit={handleCreateAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 placeholder:text-gray-400 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="e.g. 0987654321"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 placeholder:text-gray-400 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="Street, Ward, District"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">City/Province</label>
                <input
                  type="text"
                  required
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 placeholder:text-gray-400 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="e.g. Ho Chi Minh City"
                />
              </div>
              <label className="flex items-center gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddress.is_default}
                  onChange={(e) => setNewAddress({...newAddress, is_default: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Set as default address</span>
              </label>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {savingAddress ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
