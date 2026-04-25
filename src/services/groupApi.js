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

export const getGroupStats = async (groupId) => {
    const response = await API.get(`/groups/${groupId}/stats`);
    return response;
};

export const deleteGroup = async (groupId) => {
    const response = await API.delete(`/groups/${groupId}`);
    return response.data;
};

export const getGroupStudents = async (groupId) => {
    const response = await API.get(`/groups/${groupId}/students`);
    return response.data;
};

export const updateGroup = async (groupId, groupData) => {
    const response = await API.put(`/groups/${groupId}`, groupData);
    return response.data;
};

export const removeStudentFromGroup = async (studentId) => {
    const response = await API.post('/groups/remove-student', { studentId });
    return response.data;
};

export const moveStudentToGroup = async (studentId, newGroupId) => {
    const response = await API.post('/groups/move-student', { studentId, newGroupId });
    return response.data;
};
