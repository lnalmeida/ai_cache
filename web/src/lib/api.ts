import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5051/api/AICache';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config => {
  // You can add authorization headers or other custom headers here
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}), error => {
  return Promise.reject(error);
});

api.interceptors.response.use(response => 
  response, (error) => {
      if (error.response.status === 401) {
        console.error('Unauthorized access - perhaps redirect to login?');
      }
      return Promise.reject(error);

    }   
);