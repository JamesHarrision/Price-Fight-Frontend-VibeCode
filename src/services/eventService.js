import api from './api';

export const getAllEvents = async (page = 1, limit = 10, status) => {
  const response = await api.get('/events', { params: { page, limit, status } });
  return response.data;
};

export const createEvent = async (formData) => {
  const response = await api.post('/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateEvent = async (eventId, formData) => {
  const response = await api.put(`/events/${eventId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/events/${eventId}`);
  return response.data;
};

export const addParticipantByAdmin = async (eventId, userId) => {
  const response = await api.post(`/events/${eventId}/participants`, { userId });
  return response.data;
};

export const kickUser = async (eventId, userId) => {
  const response = await api.delete(`/events/${eventId}/participants/${userId}`);
  return response.data;
};

export const getEventById = async (eventId) => {
  const response = await api.get(`/events/${eventId}`);
  return response.data.data.event;
};

export const joinEvent = async (eventId) => {
  const response = await api.post(`/events/${eventId}/join`);
  return response.data;
};

export const getParticipants = async (eventId) => {
  const response = await api.get(`/events/${eventId}/participants`);
  return response.data.data;
};
