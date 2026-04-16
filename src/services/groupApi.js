import API from './api';

export const createGroup = async (groupData) => {
    const response = await API.post('/groups', groupData);
    return response.data;
};

export const getGroups = async () => {
    const response = await API.get('/groups');
    return response.data;
};

export const getTeacherGroups = async (teacherId) => {
    const response = await API.get(`/groups/teacher/${teacherId}`);
    return response.data;
};
