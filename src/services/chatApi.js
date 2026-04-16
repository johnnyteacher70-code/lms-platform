import api from './api';

export const getMessages = async (user1, user2) => {
  return await api.get(`/chat/messages/${user1}/${user2}`);
};

export const getTeacherContacts = async (teacherId) => {
  return await api.get(`/chat/contacts/teacher/${teacherId}`);
};

export const getStudentTeacher = async (studentId) => {
  return await api.get(`/chat/contacts/student/${studentId}`);
};
