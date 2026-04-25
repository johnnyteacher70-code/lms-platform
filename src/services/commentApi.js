import api from './api';

export const getLessonComments = async (lessonId) => {
  const response = await api.get(`/comments/${lessonId}`);
  return response.data;
};

export const postComment = async (commentData) => {
  const response = await api.post('/comments', commentData);
  return response.data;
};
