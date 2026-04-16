import API from './api';

export const createModule = async (moduleData) => {
    const response = await API.post('/modules', moduleData);
    return response.data;
};

export const getTeacherModules = async (teacherId) => {
    const response = await API.get(`/modules/teacher/${teacherId}`);
    return response.data;
};

export const getStudentModules = async (groupId) => {
    const response = await API.get(`/modules/student/${groupId}`);
    return response.data;
};

export const createLesson = async (formData) => {
    const response = await API.post('/lessons', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const getLessonsByModule = async (moduleId) => {
    const response = await API.get(`/lessons/${moduleId}`);
    return response.data;
};
