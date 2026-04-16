import API from './api';

export const getAssignments = async (groupId = '') => {
    const url = groupId ? `/assignments?groupId=${groupId}` : '/assignments';
    const response = await API.get(url);
    return response.data;
};

export const createAssignment = async (assignmentData) => {
    const response = await API.post('/assignments', assignmentData);
    return response.data;
};
