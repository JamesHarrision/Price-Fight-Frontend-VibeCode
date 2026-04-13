import api from './api';

export const getMe = async () => {
  const response = await api.get('/users/me');
  return response.data.data;
};

export const deposit = async (amount) => {
  const response = await api.post('/users/wallet/deposit', { amount });
  return response.data;
};

export const getAllUsers = async (page = 1, limit = 10, search = '') => {
  const response = await api.get('/users', { params: { page, limit, search } });
  return response.data;
};

export const updateUserByAdmin = async (userId, data) => {
  const response = await api.put(`/admin/users/${userId}`, data);
  return response.data;
};

// --- Profile & Addresses ---
export const updateProfile = async (formData) => {
  // formData is used instead of JSON because of file upload (avatar)
  const response = await api.put('/users/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const getAddresses = async () => {
  const response = await api.get('/users/addresses');
  return response.data.data;
};

export const addAddress = async (data) => {
  const response = await api.post('/users/addresses', data);
  return response.data;
};

export const deleteAddress = async (addressId) => {
  const response = await api.delete(`/users/addresses/${addressId}`);
  return response.data;
};

// --- Live Bids ---
export const getMyBids = async () => {
  const response = await api.get('/users/bids');
  return response.data.data;
};
