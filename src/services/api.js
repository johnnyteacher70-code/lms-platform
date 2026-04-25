import axios from 'axios';

// Create an Axios instance
// You can override this URL by creating a .env file later with VITE_API_URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://lms-platform-efpp.onrender.com/api',
});

// Request interceptor to automatically attach the JWT token to headers
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
