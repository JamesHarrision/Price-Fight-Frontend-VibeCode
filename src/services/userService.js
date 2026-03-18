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
