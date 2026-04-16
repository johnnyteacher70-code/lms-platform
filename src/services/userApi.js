import API from './api';

export const getAllUsers = async () => {
    const response = await API.get('/users');
    return response.data;
};

// Yangi qo'shilgan: Foydalanuvchini (har qanday rol) o'chirish marshruti
export const deleteUser = async (userId) => {
    const response = await API.delete(`/users/${userId}`);
    return response.data;
};

// Foydalanuvchini tahrirlash
export const updateUser = async (userId, data) => {
    const response = await API.put(`/users/${userId}`, data);
    return response.data;
};
