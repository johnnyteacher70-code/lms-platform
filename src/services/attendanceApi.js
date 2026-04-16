import API from './api';

export const saveAttendance = async (attendanceData) => {
    const response = await API.post('/attendance', attendanceData);
    return response.data;
};

export const getAttendance = async (groupId, date) => {
    const response = await API.get(`/attendance?groupId=${groupId}&date=${date}`);
    return response.data;
};
