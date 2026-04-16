import api from './api';

export const getNotifications = async (userId) => {
  const response = await api.get(`/notifications/${userId}`);
  return response;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response;
};

export const markAllAsRead = async (userId) => {
  const response = await api.put(`/notifications/read-all/${userId}`);
  return response;
};
