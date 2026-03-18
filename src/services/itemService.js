import api from './api';

export const getItemsByEventId = async (eventId) => {
  const response = await api.get(`/events/${eventId}/items`);
  return response.data; // Backend returns { items: [...] } or { data: { items: [...] } }
};

export const getItemDetail = async (itemId) => {
  const response = await api.get(`/items/${itemId}`);
  return response.data;
};

export const placeBid = async (eventId, itemId, amount) => {
  const response = await api.post(`/events/${eventId}/items/${itemId}/bids`, { amount });
  return response.data;
};

export const updateItem = async (itemId, data) => {
  const response = await api.put(`/items/${itemId}`, data);
  return response.data;
};

export const createItem = async (data, eventId = null) => {
  const url = eventId ? `/events/${eventId}/items` : '/items';

  const config = {};
  if (data instanceof FormData) {
    config.headers = { 'Content-Type': 'multipart/form-data' };
  }

  const response = await api.post(url, data, config);
  return response.data;
};

export const getInventoryItems = async (page = 1, limit = 10, search = '', status = '', unassignedOnly = false) => {
  const response = await api.get('/items/inventory', { params: { page, limit, search, status, unassignedOnly } });
  return response.data;
};
