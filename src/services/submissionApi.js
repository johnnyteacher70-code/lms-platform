import API from './api';

export const submitAssignment = async (data) => {
    const response = await API.post('/submissions', data);
    return response.data;
};

export const getTeacherSubmissions = async (teacherId) => {
    const response = await API.get(`/submissions/teacher/${teacherId}`);
    return response.data;
};

export const updateSubmissionStatus = async (id, data) => {
    const response = await API.patch(`/submissions/${id}`, data);
    return response.data;
};

export const getStudentSubmissions = async (studentId) => {
    const response = await API.get(`/submissions/student/${studentId}`);
    return response.data;
};
