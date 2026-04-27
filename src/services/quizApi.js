import API from './api';

export const createQuiz = async (quizData) => {
    const response = await API.post('/quizzes', quizData);
    return response.data;
};

export const getGroupQuizzes = async (groupId) => {
    const response = await API.get(`/quizzes/group/${groupId}`);
    return response.data;
};

export const submitQuiz = async (submissionData) => {
    const response = await API.post('/quizzes/submit', submissionData);
    return response.data;
};

export const getMyQuizResults = async () => {
    const response = await API.get('/quizzes/my-results');
    return response.data;
};
