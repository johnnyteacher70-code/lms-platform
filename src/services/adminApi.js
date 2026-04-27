import API from './api';

export const getAdminStats = async () => {
    const response = await API.get('/admin/stats');
    return response.data;
};
