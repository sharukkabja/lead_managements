import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;

      if (status === 401) {
        console.warn('Unauthorized - redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      if (status === 500) {
        console.error('Server error');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
