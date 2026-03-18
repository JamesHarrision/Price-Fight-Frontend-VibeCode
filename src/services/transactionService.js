import api from './api';

export const getUserTransactions = async () => {
  const response = await api.get('/users/me/transactions');
  return response.data;
};

export const payTransaction = async (transactionId) => {
  const response = await api.post(`/transactions/${transactionId}/pay`);
  return response.data;
};
